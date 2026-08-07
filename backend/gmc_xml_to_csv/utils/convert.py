"""GMC RSS/XML product feed → flattened product rows."""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from typing import Optional
from urllib.parse import urljoin, urlparse

import requests

from sitemap_to_csv.utils.sitemap_parser import SitemapParseError, validate_url

MAX_BYTES = 20 * 1024 * 1024  # 20 MB
MAX_ITEMS = 50_000
FETCH_TIMEOUT = 30
MAX_REDIRECTS = 5
SHIP_COLS = 3

PRICE_RE = re.compile(r"^\s*([0-9]+(?:\.[0-9]+)?)\s+([A-Za-z]{3})\s*$")


class GmcParseError(ValueError):
    """User-facing parse / fetch error."""


def _local_name(tag: str) -> str:
    if "}" in tag:
        return tag.rsplit("}", 1)[-1]
    return tag


def _trim_one_line(s: str) -> str:
    s = (s or "").strip()
    s = s.replace("\t", " ").replace("\r", " ").replace("\n", " ")
    return " ".join(s.split())


def _child_text(el: ET.Element, name: str) -> str:
    for child in el:
        if _local_name(child.tag) == name:
            return (child.text or "").strip()
    return ""


def _child_texts(el: ET.Element, name: str) -> list[str]:
    values: list[str] = []
    for child in el:
        if _local_name(child.tag) == name:
            text = (child.text or "").strip()
            if text:
                values.append(text)
    return values


def _first_child(el: ET.Element, name: str) -> Optional[ET.Element]:
    for child in el:
        if _local_name(child.tag) == name:
            return child
    return None


def _children(el: ET.Element, name: str) -> list[ET.Element]:
    return [child for child in el if _local_name(child.tag) == name]


def split_price(raw: str) -> tuple[str, str]:
    s = (raw or "").strip()
    if not s:
        return "", ""
    m = PRICE_RE.match(s)
    if m:
        return m.group(1), m.group(2).upper()
    return s, ""


def fetch_feed_url(url: str) -> tuple[bytes, str]:
    """Fetch feed bytes with SSRF checks, size cap, and redirect validation."""
    current = url.strip()
    session = requests.Session()
    session.max_redirects = 0

    for _ in range(MAX_REDIRECTS + 1):
        try:
            validate_url(current)
        except SitemapParseError as exc:
            raise GmcParseError(str(exc)) from exc

        try:
            resp = session.get(
                current,
                timeout=FETCH_TIMEOUT,
                stream=True,
                allow_redirects=False,
                headers={"User-Agent": "PreboTools-GmcXmlToCsv/1.0"},
            )
        except requests.Timeout as exc:
            raise GmcParseError("Fetch timed out") from exc
        except requests.RequestException as exc:
            raise GmcParseError(f"Failed to fetch feed: {exc}") from exc

        if resp.is_redirect or resp.status_code in (301, 302, 303, 307, 308):
            location = resp.headers.get("Location")
            resp.close()
            if not location:
                raise GmcParseError("Redirect without Location header")
            current = urljoin(current, location)
            continue

        if resp.status_code >= 400:
            code = resp.status_code
            resp.close()
            raise GmcParseError(f"Fetch failed with HTTP {code}")

        chunks: list[bytes] = []
        total = 0
        try:
            for chunk in resp.iter_content(chunk_size=64 * 1024):
                if not chunk:
                    continue
                total += len(chunk)
                if total > MAX_BYTES:
                    raise GmcParseError(
                        f"Feed exceeds maximum size of {MAX_BYTES // (1024 * 1024)} MB"
                    )
                chunks.append(chunk)
        finally:
            resp.close()

        data = b"".join(chunks)
        name_hint = urlparse(current).path or current
        return data, name_hint

    raise GmcParseError("Too many redirects")


def _find_items(root: ET.Element) -> list[ET.Element]:
    root_name = _local_name(root.tag)

    if root_name == "rss":
        channel = _first_child(root, "channel")
        if channel is None:
            raise GmcParseError("RSS feed missing <channel>")
        return _children(channel, "item")

    if root_name == "channel":
        return _children(root, "item")

    if root_name == "feed":
        # Atom-style: treat <entry> like items if present
        entries = _children(root, "entry")
        if entries:
            return entries
        return _children(root, "item")

    # Fallback: collect descendant items
    items = [el for el in root.iter() if _local_name(el.tag) == "item"]
    if items:
        return items

    raise GmcParseError(
        f"Unsupported feed root element: <{root_name}>. Expected rss with channel/item."
    )


def _item_to_row(item: ET.Element) -> dict[str, str]:
    price_raw = _child_text(item, "price")
    price_value, price_currency = split_price(price_raw)

    tax_el = _first_child(item, "tax")
    tax_country = _child_text(tax_el, "country") if tax_el is not None else ""
    tax_rate = _child_text(tax_el, "rate") if tax_el is not None else ""
    tax_ship = _child_text(tax_el, "tax_ship") if tax_el is not None else ""

    additional = _child_texts(item, "additional_image_link")
    shipping_els = _children(item, "shipping")

    row: dict[str, str] = {
        "id": _child_text(item, "id"),
        "title": _trim_one_line(_child_text(item, "title")),
        "description": _trim_one_line(_child_text(item, "description")),
        "google_product_category": _trim_one_line(
            _child_text(item, "google_product_category")
        ),
        "product_type": _trim_one_line(_child_text(item, "product_type")),
        "link": _child_text(item, "link"),
        "image_link": _child_text(item, "image_link"),
        "additional_image_links": "|".join(additional),
        "original_image_url": _child_text(item, "original_image_url"),
        "condition": _child_text(item, "condition"),
        "availability": _child_text(item, "availability"),
        "price_value": price_value,
        "price_currency": price_currency,
        "brand": _child_text(item, "brand"),
        "identifier_exists": _child_text(item, "identifier_exists"),
        "color": _child_text(item, "color"),
        "size": _child_text(item, "size"),
        "tax_country": tax_country,
        "tax_rate": tax_rate,
        "tax_ship": tax_ship,
    }

    for i in range(SHIP_COLS):
        prefix = f"shipping_{i + 1}_"
        if i < len(shipping_els):
            s = shipping_els[i]
            row[prefix + "country"] = _child_text(s, "country")
            row[prefix + "service"] = _trim_one_line(_child_text(s, "service"))
            row[prefix + "price"] = _child_text(s, "price")
        else:
            row[prefix + "country"] = ""
            row[prefix + "service"] = ""
            row[prefix + "price"] = ""

    return row


def parse_feed_bytes(data: bytes) -> list[dict[str, str]]:
    if not data:
        raise GmcParseError("Feed is empty")
    if len(data) > MAX_BYTES:
        raise GmcParseError(
            f"Feed exceeds maximum size of {MAX_BYTES // (1024 * 1024)} MB"
        )

    try:
        root = ET.fromstring(data)
    except ET.ParseError as exc:
        raise GmcParseError(f"Invalid feed XML: {exc}") from exc

    items = _find_items(root)
    if not items:
        raise GmcParseError("Feed contains no products")

    rows: list[dict[str, str]] = []
    for item in items:
        if len(rows) >= MAX_ITEMS:
            raise GmcParseError(f"Feed exceeds maximum of {MAX_ITEMS:,} products")
        rows.append(_item_to_row(item))

    return rows


def convert_from_url(url: str) -> list[dict[str, str]]:
    data, _hint = fetch_feed_url(url)
    rows = parse_feed_bytes(data)
    if not rows:
        raise GmcParseError("Feed contains no products")
    return rows


def convert_from_file(file_bytes: bytes, filename: str = "") -> list[dict[str, str]]:
    del filename  # unused; kept for API symmetry
    if not file_bytes:
        raise GmcParseError("Uploaded file is empty")
    if len(file_bytes) > MAX_BYTES:
        raise GmcParseError(
            f"Feed exceeds maximum size of {MAX_BYTES // (1024 * 1024)} MB"
        )
    rows = parse_feed_bytes(file_bytes)
    if not rows:
        raise GmcParseError("Feed contains no products")
    return rows
