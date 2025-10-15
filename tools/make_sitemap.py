#!/usr/bin/env python3
import os, json, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
CFG = ROOT / "site.config.json"
cfg = json.loads(CFG.read_text(encoding="utf-8"))
base = cfg["base_url"].rstrip("/")
today = datetime.date.today().isoformat()

def want(path):
    if not path.suffix.lower() in cfg["include_ext"]:
        return False
    for ex in cfg["exclude_dirs"]:
        if f"/{ex}/" in str(path.as_posix()+"/"):
            return False
    return True

def lastmod(path):
    ts = datetime.datetime.fromtimestamp(path.stat().st_mtime)
    return ts.date().isoformat()

urls = []
for p in ROOT.rglob("*"):
    if p.is_file() and want(p):
        rel = "/" + p.relative_to(ROOT).as_posix()
        loc = f"{base}{rel}"
        if rel.endswith("/index.html"):
            loc = f"{base}{rel[:-10]}"
        lm = lastmod(p)
        changefreq = next((cf for pre, cf in cfg["changefreq_rules"].items() if loc.startswith(base+pre)), "monthly")
        priority = next((pr for pre, pr in cfg["priority_rules"].items() if loc.startswith(base+pre)), 0.7)
        urls.append((loc, lm, changefreq, priority))

seen, dedup = set(), []
for u in urls:
    if u[0] not in seen:
        dedup.append(u)
        seen.add(u[0])
dedup.sort(key=lambda x: (0 if x[0]==base or x[0]==base+"/" else 1, x[0]))

xml = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for loc, lm, cf, pr in dedup:
    if loc == base: loc += "/"
    xml.append("  <url>")
    xml.append(f"    <loc>{loc}</loc>")
    xml.append(f"    <lastmod>{lm}</lastmod>")
    xml.append(f"    <changefreq>{cf}</changefreq>")
    xml.append(f"    <priority>{pr:.1f}</priority>")
    xml.append("  </url>")
xml.append("</urlset>\n")
(ROOT / "sitemap.xml").write_text("\n".join(xml), encoding="utf-8")
print(f"[OK] sitemap.xml generated ({len(dedup)} urls)")

if cfg.get("make_robots", True):
    robots = ["User-agent: *", "Allow: /", f"Sitemap: {base}/sitemap.xml", ""]
    (ROOT / "robots.txt").write_text("\n".join(robots), encoding="utf-8")
    print("[OK] robots.txt generated")
