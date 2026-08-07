"""Split sitemap URLs into relative path segments."""

from __future__ import annotations

from typing import List, Tuple
from urllib.parse import urlparse


def break_url(url: str) -> dict:
    parsed = urlparse(url)
    relative = parsed.path or "/"
    segments = [s for s in relative.split("/") if s]
    return {
        "url": url,
        "relative_path": relative,
        "segments": segments,
    }


def break_urls(locs: List[str]) -> Tuple[List[dict], int]:
    rows = [break_url(loc) for loc in locs]
    max_depth = max((len(row["segments"]) for row in rows), default=0)
    return rows, max_depth
