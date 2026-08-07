"""Sitemap XML parser: urlset, sitemapindex, gzip, SSRF-safe URL fetch."""

from __future__ import annotations

import gzip
import ipaddress
import socket
import xml.etree.ElementTree as ET
from typing import Optional
from urllib.parse import urljoin, urlparse

import requests

MAX_BYTES = 20 * 1024 * 1024  # 20 MB
MAX_CHILD_SITEMAPS = 50
MAX_URLS = 50_000
FETCH_TIMEOUT = 30
MAX_REDIRECTS = 5

GZIP_MAGIC = b"\x1f\x8b"


class SitemapParseError(ValueError):
    """User-facing parse / fetch error."""


def _local_name(tag: str) -> str:
    if "}" in tag:
        return tag.rsplit("}", 1)[-1]
    return tag


def _child_text(el: ET.Element, name: str) -> str:
    for child in el:
        if _local_name(child.tag) == name:
            return (child.text or "").strip()
    return ""


def _is_public_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return False
    return bool(ip.is_global)


def validate_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise SitemapParseError("Only http and https URLs are allowed")
    hostname = parsed.hostname
    if not hostname:
        raise SitemapParseError("Invalid URL: missing hostname")
    if hostname.lower() in ("localhost", "metadata.google.internal"):
        raise SitemapParseError("Blocked host")

    try:
        infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise SitemapParseError(f"Could not resolve hostname: {hostname}") from exc

    if not infos:
        raise SitemapParseError(f"Could not resolve hostname: {hostname}")

    for info in infos:
        ip = info[4][0]
        if not _is_public_ip(ip):
            raise SitemapParseError("Blocked address: private or reserved IP")


def _maybe_gunzip(data: bytes, hint_name: str = "") -> bytes:
    looks_gz = data.startswith(GZIP_MAGIC) or hint_name.lower().endswith(".gz")
    if not looks_gz:
        return data
    try:
        return gzip.decompress(data)
    except OSError as exc:
        raise SitemapParseError("Failed to decompress gzip sitemap") from exc


def fetch_url(url: str) -> tuple[bytes, str]:
    """Fetch sitemap bytes with SSRF checks, size cap, and redirect validation."""
    current = url.strip()
    session = requests.Session()
    session.max_redirects = 0

    for _ in range(MAX_REDIRECTS + 1):
        validate_url(current)
        try:
            resp = session.get(
                current,
                timeout=FETCH_TIMEOUT,
                stream=True,
                allow_redirects=False,
                headers={"User-Agent": "PreboTools-SitemapToCSV/1.0"},
            )
        except requests.Timeout as exc:
            raise SitemapParseError("Fetch timed out") from exc
        except requests.RequestException as exc:
            raise SitemapParseError(f"Failed to fetch sitemap: {exc}") from exc

        if resp.is_redirect or resp.status_code in (301, 302, 303, 307, 308):
            location = resp.headers.get("Location")
            resp.close()
            if not location:
                raise SitemapParseError("Redirect without Location header")
            # Resolve relative redirects
            current = urljoin(current, location)
            continue

        if resp.status_code >= 400:
            code = resp.status_code
            resp.close()
            raise SitemapParseError(f"Fetch failed with HTTP {code}")

        chunks: list[bytes] = []
        total = 0
        try:
            for chunk in resp.iter_content(chunk_size=64 * 1024):
                if not chunk:
                    continue
                total += len(chunk)
                if total > MAX_BYTES:
                    raise SitemapParseError(
                        f"Sitemap exceeds maximum size of {MAX_BYTES // (1024 * 1024)} MB"
                    )
                chunks.append(chunk)
        finally:
            resp.close()

        data = b"".join(chunks)
        name_hint = urlparse(current).path or current
        return data, name_hint

    raise SitemapParseError("Too many redirects")


def _parse_url_element(el: ET.Element) -> dict[str, str]:
    return {
        "loc": _child_text(el, "loc"),
        "lastmod": _child_text(el, "lastmod"),
        "changefreq": _child_text(el, "changefreq"),
        "priority": _child_text(el, "priority"),
    }


def _parse_xml_bytes(data: bytes) -> ET.Element:
    try:
        return ET.fromstring(data)
    except ET.ParseError as exc:
        raise SitemapParseError(f"Invalid sitemap XML: {exc}") from exc


def parse_sitemap_bytes(
    data: bytes,
    *,
    name_hint: str = "",
    fetch_children: bool = True,
    _child_count: Optional[list[int]] = None,
    _seen_locs: Optional[set[str]] = None,
) -> list[dict[str, str]]:
    """
    Parse sitemap bytes into URL rows.
    Recurses into sitemapindex child locs when fetch_children is True.
    """
    data = _maybe_gunzip(data, name_hint)
    root = _parse_xml_bytes(data)
    root_name = _local_name(root.tag)

    if _seen_locs is None:
        _seen_locs = set()
    if _child_count is None:
        _child_count = [0]

    rows: list[dict[str, str]] = []

    if root_name == "urlset":
        for el in root:
            if _local_name(el.tag) != "url":
                continue
            row = _parse_url_element(el)
            loc = row["loc"]
            if not loc:
                continue
            if loc in _seen_locs:
                continue
            if len(_seen_locs) >= MAX_URLS:
                raise SitemapParseError(
                    f"Sitemap exceeds maximum of {MAX_URLS:,} URLs"
                )
            _seen_locs.add(loc)
            rows.append(row)
        return rows

    if root_name == "sitemapindex":
        if not fetch_children:
            raise SitemapParseError(
                "Received a sitemap index but child fetching is disabled"
            )
        child_locs: list[str] = []
        for el in root:
            if _local_name(el.tag) != "sitemap":
                continue
            loc = _child_text(el, "loc")
            if loc:
                child_locs.append(loc)

        if not child_locs:
            raise SitemapParseError("Sitemap index contains no child sitemaps")

        for child_url in child_locs:
            if _child_count[0] >= MAX_CHILD_SITEMAPS:
                raise SitemapParseError(
                    f"Sitemap index exceeds maximum of {MAX_CHILD_SITEMAPS} child sitemaps"
                )
            _child_count[0] += 1
            child_bytes, child_hint = fetch_url(child_url)
            rows.extend(
                parse_sitemap_bytes(
                    child_bytes,
                    name_hint=child_hint,
                    fetch_children=True,
                    _child_count=_child_count,
                    _seen_locs=_seen_locs,
                )
            )
        return rows

    raise SitemapParseError(
        f"Unsupported sitemap root element: <{root_name}>. Expected urlset or sitemapindex."
    )


def convert_from_url(url: str) -> list[dict[str, str]]:
    data, hint = fetch_url(url)
    rows = parse_sitemap_bytes(data, name_hint=hint)
    if not rows:
        raise SitemapParseError("Sitemap contains no URLs")
    return rows


def convert_from_file(file_bytes: bytes, filename: str = "") -> list[dict[str, str]]:
    if len(file_bytes) > MAX_BYTES:
        raise SitemapParseError(
            f"Sitemap exceeds maximum size of {MAX_BYTES // (1024 * 1024)} MB"
        )
    if not file_bytes:
        raise SitemapParseError("Uploaded file is empty")
    rows = parse_sitemap_bytes(file_bytes, name_hint=filename)
    if not rows:
        raise SitemapParseError("Sitemap contains no URLs")
    return rows
