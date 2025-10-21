/**
 * i18n.js — 统一语言切换（顶部按钮），对不存在的元素“无感”以避免影响其他页面。
 * 约定：
 * - 顶栏按钮：#langBtn 内含 #langLabel
 * - 成对内容块：.lang-zh / .lang-en
 * - 可选词典：data-i18n="key"（若 key 不在词典中，保持原文）
 * - 简历 PDF（可选）：#downloadPdfBtn（若不存在则忽略）
 */

(function () {
  // —— 最小词典（可按需扩展，不用的 key 不会生效）——
  const dict = {
    zh: {
      brand: "张广健",
      "nav.about": "关于我",
      "nav.research": "研究",
      "nav.blog": "博客",
      "nav.resume": "简历",
      "nav.contact": "联系",
      "h.about": "关于我",
      "h.research": "研究方向",
      "h.news": "近期更新",
      "h.contact": "联系方式",
      name: "张广健",
      title: "深圳大学（本科），物理学（卓越班）",
      loc: "深圳市南山区",
      website: "个人网站",
      email: "邮箱",
      resumeLink: "查看简历",
      license: "CC BY-NC-SA 4.0",
      "about.1": `我是张广健，深圳大学物理学本科生，目前专注于 AdS/CFT 对应、弦论与全息超导等方向的学习与研究。<br>
在研究团队中，我主要负责引力侧的建模与数值计算工作，探索 AdS/CFT 在引入晶格结构的全息超导体系的应用。<br>
未来希望攻读相关方向的硕士或博士学位，继续深入量子理论与引力交叉的最前沿。`
    },
    en: {
      brand: "Guangjian Zhang",
      "nav.about": "About",
      "nav.research": "Research",
      "nav.blog": "Blog",
      "nav.resume": "Resume",
      "nav.contact": "Contact",
      "h.about": "About me",
      "h.research": "Research interests",
      "h.news": "Recent updates",
      "h.contact": "Contact",
      name: "Guangjian Zhang",
      title: "Undergraduate, Physics · SZU",
      loc: "Nanshan, Shenzhen",
      website: "Website",
      email: "Email",
      resumeLink: "View Resume",
      license: "CC BY-NC-SA 4.0",
      "about.1": `I am Guangjian Zhang, an undergraduate student in Physics at Shenzhen University.<br>
My current studies and research focus on AdS/CFT correspondence, string theory, and holographic superconductivity.<br>
Within my research group, I am mainly responsible for gravitational modeling and numerical calculations, exploring the application of AdS/CFT in holographic superconductor systems with lattice structures.<br>
In the future, I aim to pursue a Master’s or Ph.D. degree in related fields and continue to work at the frontiers of quantum theory and gravity.`
    }
  };

  // 局部配置：仅当页面存在该元素时才应用
  const PDF_MAP = {
    zh: { href: "./pdf/cv-zh.pdf", name: "cv-zh.pdf", label: "⬇ 下载 PDF" },
    en: { href: "./pdf/cv-en.pdf", name: "cv-en.pdf", label: "⬇ Download PDF" }
  };

  const LS_KEY = "site.lang";
  const $html = document.documentElement;
  const $btn = document.getElementById("langBtn");
  const $label = document.getElementById("langLabel");

  // 取初始语言：?lang= > localStorage > <html lang> > 浏览器
  const urlLang = new URLSearchParams(location.search).get("lang");
  const saved = localStorage.getItem(LS_KEY);
  const htmlLang = ($html.getAttribute("lang") || "").toLowerCase();
  const navLang = (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
  const initial = (urlLang || saved || htmlLang || navLang || "zh").toLowerCase();

  applyLang(initial, false);

  if ($btn) {
    $btn.addEventListener("click", () => {
      const cur = ($html.getAttribute("lang") || "zh").toLowerCase();
      const next = cur === "zh" ? "en" : "zh";
      applyLang(next, true);
    });
  }

  function applyLang(lang, persist) {
    if (!["zh", "en"].includes(lang)) lang = "zh";
    $html.setAttribute("lang", lang);

    // 顶部按钮标签
    if ($label) $label.textContent = (lang === "zh" ? "中文 / EN" : "EN / 中文");

    // 1) 成对内容块显隐（若页面没有这些类，则什么都不做）
    document.querySelectorAll(".lang-zh").forEach(el => {
      el.style.display = lang === "zh" ? "" : "none";
    });
    document.querySelectorAll(".lang-en").forEach(el => {
      el.style.display = lang === "en" ? "" : "none";
    });

    // 2) data-i18n 词典替换（存在 key 才替换；含 HTML 标签时使用 innerHTML）
    const map = dict[lang] || {};
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (key && typeof map[key] === "string") {
        const val = map[key];
        if (val.includes("<")) {
          el.innerHTML = val;      // 允许 <br> 等生效
        } else {
          el.textContent = val;    // 纯文本仍走 textContent
        }
      }
    });


    // 3) 简历 PDF 按钮（仅当该元素存在时才切换）
    const $pdf = document.getElementById("downloadPdfBtn");
    if ($pdf && PDF_MAP[lang]) {
      $pdf.href = PDF_MAP[lang].href;
      $pdf.setAttribute("download", PDF_MAP[lang].name);
      $pdf.textContent = PDF_MAP[lang].label;
    }

    // 4) 地址栏与持久化（仅在显式切换时改 URL；首次也保存一次）
    if (persist) {
      const sp = new URLSearchParams(location.search);
      sp.set("lang", lang);
      history.replaceState(null, "", `${location.pathname}?${sp.toString()}`);
    }
    localStorage.setItem(LS_KEY, lang);
  }
})();
