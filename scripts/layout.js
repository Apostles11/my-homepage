// scripts/layout.js
(function(){
  // —— 自动推断根前缀（兼容根域 / 与 GitHub Pages /repo-name）
  function getBasePrefix() {
    const path = location.pathname; // e.g. /index.html, /search/index.html, /my-homepage/articles/post.html
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] !== 'search' && parts[0] !== 'articles' && parts[0] !== 'resume') {
      return '/' + parts[0]; // /my-homepage
    }
    return '';
  }
  // —— 计算从当前页到站点根的相对路径（用于 <link> 与资源引用）
  function relToRoot() {
    const path = location.pathname; // /, /articles/x.html
    const depth = path.split('/').filter(Boolean).length - 1; // index.html 深度 1-1=0；/articles/x.html 深度 =2-1=1
    return depth <= 0 ? '' : '../'.repeat(depth);
  }

  const base = getBasePrefix();   // 用于绝对路径（/repo-name/...）
  const rel  = relToRoot();       // 用于相对资源（../styles/main.css）

  // —— 从 <script data-page="..."> 读取当前页类型，用于高亮导航
  const me = (document.currentScript && document.currentScript.dataset.page) || '';

  // —— 语言键
  const i18n = {
    zh: {
      brand:"张广健",
      nav:{about:"关于我", research:"研究", blog:"博客", resume:"简历", contact:"联系"},
      search_placeholder:"站内搜索…",
      lang_toggle:"中文 / EN",
      license:"许可：CC BY-NC-SA 4.0"
    },
    en: {
      brand:"Guangjian Zhang",
      nav:{about:"About", research:"Research", blog:"Blog", resume:"Resume", contact:"Contact"},
      search_placeholder:"Search…",
      lang_toggle:"EN / 中文",
      license:"License: CC BY-NC-SA 4.0"
    }
  };
  const pref = (localStorage.getItem('site-lang') || (navigator.language.startsWith('zh')?'zh':'en'));
  const L = i18n[pref];

  // —— 头部 HTML
  const headerHTML = `
  <header class="site-header">
    <nav class="nav" aria-label="Primary">
      <a class="brand" href="${base}/index.html">${L.brand}</a>
      <a href="${base}/index.html#about" ${me==='about'?'aria-current="page"':''}>${L.nav.about}</a>
      <a href="${base}/index.html#research" ${me==='research'?'aria-current="page"':''}>${L.nav.research}</a>
      <a href="${base}/articles/index.html" ${me==='blog'?'aria-current="page"':''}>${L.nav.blog}</a>
      <a href="${base}/resume/index.html" ${me==='resume'?'aria-current="page"':''}>${L.nav.resume}</a>
      <a href="${base}/index.html#contact" ${me==='contact'?'aria-current="page"':''}>${L.nav.contact}</a>
      <span class="spacer"></span>
      <form class="searchbar" action="${base}/search/index.html" method="get" role="search">
        <input type="search" name="q" placeholder="${L.search_placeholder}" />
        <button type="submit">Search</button>
      </form>
      <button class="lang-switch" id="langBtn"><span id="langLabel">${pref==='en'?'EN':'中文'}</span> / ${pref==='en'?'中文':'EN'}</button>
    </nav>
  </header>`.trim();

  // —— 页脚 HTML
  const year = new Date().getFullYear();
  const footerHTML = `
  <footer class="site-footer">
    <small>© ${year} Guangjian Zhang · ${L.license}</small>
  </footer>`.trim();

  // —— 注入到占位容器
  const headerMount = document.getElementById('app-header') || document.body.insertAdjacentElement('afterbegin', document.createElement('div'));
  headerMount.outerHTML = headerHTML;
  const footerMount = document.getElementById('app-footer') || document.body.insertAdjacentElement('beforeend', document.createElement('div'));
  footerMount.outerHTML = footerHTML;

  // —— 挂载语言切换（复用 i18n.js 若已存在，则仅更新按钮；否则做最小切换）
  const btn = document.getElementById('langBtn');
  if (btn) {
    btn.addEventListener('click', ()=>{
      const now = localStorage.getItem('site-lang') || (navigator.language.startsWith('zh')?'zh':'en');
      localStorage.setItem('site-lang', now==='zh'?'en':'zh');
      location.reload(); // 简洁可靠：刷新后由 i18n.js 或本文件重绘
    });
  }
})();
