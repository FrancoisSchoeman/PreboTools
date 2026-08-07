"""Async concurrent page crawl → in-memory markdown files."""

from __future__ import annotations

import asyncio
import hashlib
import logging
import re
from pathlib import PurePosixPath
from typing import Optional, TypedDict
from urllib.parse import unquote, urljoin, urlparse

import httpx
import trafilatura
from trafilatura import extract_metadata

from .sitemap import USER_AGENT, validate_url, SitemapToMarkdownError

logger = logging.getLogger(__name__)

MAX_REDIRECTS = 5
MAX_PAGE_BYTES = 5 * 1024 * 1024  # 5 MB per page


class MarkdownResult(TypedDict):
    path: str
    url: str
    title: str
    content: str


def _slug_segment(segment: str) -> str:
    slug = re.sub(r"[^\w\-]+", "-", unquote(segment), flags=re.UNICODE)
    slug = re.sub(r"-{2,}", "-", slug).strip("-").lower()
    return slug or "page"


def url_to_relpath(url: str, used: set[str]) -> PurePosixPath:
    """Map URL path to relative output path, preserving parent folders."""
    parts = [p for p in unquote(urlparse(url).path).split("/") if p]
    if not parts:
        rel = PurePosixPath("index.md")
    else:
        segments = [_slug_segment(p) for p in parts]
        if len(segments) > 1:
            rel = PurePosixPath(*segments[:-1]) / f"{segments[-1]}.md"
        else:
            rel = PurePosixPath(f"{segments[0]}.md")

    key = rel.as_posix()
    if key not in used:
        used.add(key)
        return rel

    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:8]
    rel = rel.with_name(f"{rel.stem}-{digest}{rel.suffix}")
    used.add(rel.as_posix())
    return rel


def html_to_markdown(html: str, url: str) -> tuple[str, str]:
    """Return (title, markdown body)."""
    meta = extract_metadata(html, default_url=url)
    title = (meta.title if meta and meta.title else "") or urlparse(url).path or url

    body = trafilatura.extract(
        html,
        url=url,
        output_format="markdown",
        include_comments=False,
        include_tables=True,
        favor_recall=True,
    )
    if not body:
        body = ""
    return title.strip(), body.strip()


def format_markdown(title: str, url: str, body: str) -> str:
    parts = [f"# {title}", "", f"Source: {url}", "", "---", ""]
    if body:
        parts.append(body)
        parts.append("")
    return "\n".join(parts)


async def _safe_get(
    client: httpx.AsyncClient,
    url: str,
) -> Optional[httpx.Response]:
    """GET with SSRF checks on each hop; no automatic redirect following."""
    current = url.strip()
    for _ in range(MAX_REDIRECTS + 1):
        try:
            validate_url(current)
        except SitemapToMarkdownError:
            logger.warning("Skip %s: blocked URL", current)
            return None

        try:
            response = await client.get(current, follow_redirects=False)
        except httpx.HTTPError as exc:
            logger.warning("Skip %s: %s", current, exc)
            return None

        if response.is_redirect or response.status_code in (
            301,
            302,
            303,
            307,
            308,
        ):
            location = response.headers.get("Location")
            if not location:
                logger.warning("Skip %s: redirect without Location", current)
                return None
            current = urljoin(current, location)
            continue

        return response

    logger.warning("Skip %s: too many redirects", url)
    return None


async def crawl_page(
    url: str,
    client: httpx.AsyncClient,
    relpath: PurePosixPath,
    semaphore: asyncio.Semaphore,
) -> Optional[MarkdownResult]:
    async with semaphore:
        response = await _safe_get(client, url)
        if response is None:
            return None

        if response.status_code < 200 or response.status_code >= 300:
            logger.warning("Skip %s: HTTP %s", url, response.status_code)
            return None

        content_type = response.headers.get("content-type", "").lower()
        if content_type and "html" not in content_type and "xml" not in content_type:
            logger.warning(
                "Skip %s: non-HTML (%s)", url, content_type.split(";")[0]
            )
            return None

        content_length = response.headers.get("content-length")
        if content_length and content_length.isdigit():
            if int(content_length) > MAX_PAGE_BYTES:
                logger.warning("Skip %s: body too large", url)
                return None

        html = response.text
        if len(html.encode("utf-8", errors="ignore")) > MAX_PAGE_BYTES:
            logger.warning("Skip %s: body too large", url)
            return None

        if not html or not html.strip():
            logger.warning("Skip %s: empty body", url)
            return None

    title, body = await asyncio.to_thread(html_to_markdown, html, url)
    if not body:
        logger.warning("Skip %s: no extractable content", url)
        return None

    content = format_markdown(title, url, body)
    return {
        "path": relpath.as_posix(),
        "url": url,
        "title": title,
        "content": content,
    }


async def crawl_all(
    urls: list[str],
    *,
    concurrency: int = 10,
    timeout: float = 30.0,
) -> tuple[list[MarkdownResult], int, int]:
    """Crawl URLs concurrently. Return (files, ok_count, fail_count)."""
    used_names: set[str] = set()
    semaphore = asyncio.Semaphore(concurrency)

    headers = {"User-Agent": USER_AGENT}
    limits = httpx.Limits(
        max_connections=concurrency, max_keepalive_connections=concurrency
    )

    async with httpx.AsyncClient(
        headers=headers,
        timeout=timeout,
        follow_redirects=False,
        limits=limits,
    ) as client:
        tasks = [
            crawl_page(
                url,
                client,
                url_to_relpath(url, used_names),
                semaphore,
            )
            for url in urls
        ]
        results = await asyncio.gather(*tasks)

    files = [r for r in results if r is not None]
    ok = len(files)
    fail = len(results) - ok
    return files, ok, fail
