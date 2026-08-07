"""Orchestrate sitemap parse → crawl → markdown files."""

from __future__ import annotations

import asyncio

from .crawler import MarkdownResult, crawl_all
from .sitemap import (
    SitemapToMarkdownError,
    urls_from_sitemap_file,
    urls_from_sitemap_url,
)


def convert_from_url(url: str) -> tuple[list[MarkdownResult], int, int]:
    urls = urls_from_sitemap_url(url)
    files, ok, fail = asyncio.run(crawl_all(urls))
    if ok == 0:
        raise SitemapToMarkdownError(
            "No pages could be converted to markdown. "
            "Pages may be unreachable or have no extractable content."
        )
    return files, ok, fail


def convert_from_file(
    file_bytes: bytes, filename: str = ""
) -> tuple[list[MarkdownResult], int, int]:
    urls = urls_from_sitemap_file(file_bytes, filename=filename)
    files, ok, fail = asyncio.run(crawl_all(urls))
    if ok == 0:
        raise SitemapToMarkdownError(
            "No pages could be converted to markdown. "
            "Pages may be unreachable or have no extractable content."
        )
    return files, ok, fail
