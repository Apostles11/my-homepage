#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 articles/*.html 抽取 title/url/date/tags/summary/content，生成 data/search-index.json
依赖：仅标准库
"""
from pathlib import Path
import re, json, html

ROOT = Path(__file__).resolve().parents[1]
ARTICLES = ROOT / "articles"
OUT = ROOT / "data" / "search-index.json"

def strip_tags(html_text: str) -> str:
    # 去脚本/样式
    html_text = re.sub(r"<script[\s\S]*?</script>", " ", html_text, flags=re.I)
    html_text = re.sub(r"<style[\s\S]*?</style>", " ", html_text, flags=re.I)
    # 简单去标签
    text = re.sub(r"<[^>]+>", " ", html_text)
    text = html.unescape(text)
    # 压缩空白
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def extract_title(html_text: str) -> str:
    m = re.search(r"<title>(.*?)</title>", html_text, flags=re.I|re.S)
    if m: return html.unescape(m.group(1)).strip()
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html_text, flags=re.I|re.S)
    return html.unescape(re.sub("<[^>]+>", "", m.group(1))).strip() if m else ""

def extract_meta_desc(html_text: str) -> str:
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html_text, flags=re.I)
    return html.unescape(m.group(1)).strip() if m else ""

def extract_date(html_text: str) -> str:
    # 支持 <time datetime="YYYY-MM-DD"> 或 data-date="YYYY-MM-DD"
    m = re.search(r'<time[^>]*datetime=["\'](\d{4}-\d{2}-\d{2})["\']', html_text, flags=re.I)
    if m: return m.group(1)
    m = re.search(r'data-date=["\'](\d{4}-\d{2}-\d{2})["\']', html_text, flags=re.I)
    return m.group(1) if m else ""

def extract_tags(html_text: str):
    # 支持 data-tags="tag1,tag2"
    m = re.search(r'data-tags=["\']([^"\']+)["\']', html_text, flags=re.I)
    if not m: return []
    return [t.strip() for t in m.group(1).split(",") if t.strip()]

def main():
    items = []
    if not ARTICLES.exists():
        print("No articles/ directory found.")
    for p in sorted(ARTICLES.glob("**/*.html")):
        rel = p.relative_to(ROOT).as_posix()
        html_text = p.read_text(encoding="utf-8", errors="ignore")
        title = extract_title(html_text)
        summary = extract_meta_desc(html_text)
        date = extract_date(html_text)
        tags = extract_tags(html_text)
        content = strip_tags(html_text)
        items.append({
            "title": title or p.stem,
            "url": f"../{rel}",
            "date": date,
            "tags": tags,
            "summary": summary[:240],
            "content": content[:20000]  # 限制大小，够用
        })
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT} ({len(items)} items)")

if __name__ == "__main__":
    main()
