(async function () {
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').trim();
  const qShow = document.getElementById('qshow');
  const box = document.getElementById('results');
  qShow.textContent = q ? `Query: “${q}”` : '请输入关键词后回车。';
  if (!q) return;

  // 加载全文索引（包含 title/url/date/tags/summary/content 纯文本）
  let items = [];
  try {
    const res = await fetch('../data/search-index.json', { cache: 'no-store' });
    items = await res.json();
  } catch (e) {
    console.error(e);
    box.textContent = '搜索索引加载失败。';
    return;
  }

  const kw = q.toLowerCase();
  const tokens = kw.split(/\s+/).filter(Boolean);

  // 简易打分：标题命中*3 + 正文命中*1，额外考虑命中词个数
  function score(item) {
    const title = (item.title || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    let s = 0, hitWords = 0;
    tokens.forEach(t => {
      const inTitle = title.includes(t);
      const inBody  = content.includes(t);
      if (inTitle || inBody) hitWords++;
      if (inTitle) s += 3;
      if (inBody)  s += 1;
    });
    // 连续短语加成
    if (kw.length >= 3) {
      if (title.includes(kw)) s += 3;
      if (content.includes(kw)) s += 1;
    }
    return s * 100 + hitWords;
  }

  function makeSnippet(text, kw) {
    if (!text) return '';
    const low = text.toLowerCase();
    let i = low.indexOf(kw);
    if (i < 0) {
      // 若整句不含整词，找第一个 token
      for (const t of tokens) { i = low.indexOf(t); if (i >= 0) break; }
      if (i < 0) return text.slice(0, 140) + (text.length > 140 ? '…' : '');
    }
    const start = Math.max(0, i - 80);
    const end = Math.min(text.length, i + kw.length + 80);
    let snip = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    // 高亮所有 token
    tokens.sort((a,b)=>b.length-a.length).forEach(t=>{
      const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'ig');
      snip = snip.replace(re, m => `<mark>${m}</mark>`);
    });
    return snip;
  }

  const matched = items
    .map(it => ({ it, s: score(it) }))
    .filter(x => x.s > 0)
    .sort((a,b)=>b.s - a.s)
    .map(({ it }) => it);

  if (matched.length === 0) {
    box.innerHTML = `<p>未找到与 “${q}” 相关的内容。</p>`;
    return;
  }

  box.innerHTML = matched.map(it => `
    <article class="section">
      <h2 style="margin:0 0 .2rem"><a href="${it.url}">${it.title}</a></h2>
      <p style="margin:.2rem 0; color:var(--muted)">
        ${(it.date || '')} · ${(it.tags || []).join(', ')}
      </p>
      <p>${makeSnippet(it.content || it.summary || '', kw)}</p>
    </article>
  `).join('');
})();
