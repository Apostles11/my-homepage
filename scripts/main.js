// scripts/main.js
(function () {
  // 在 DOM 就绪后再执行
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    // 1) 代码高亮（若 highlight.js 已加载）
    if (window.hljs && typeof window.hljs.highlightAll === "function") {
      window.hljs.highlightAll();
    } else {
      console.warn("[main.js] highlight.js 未加载或版本不匹配，跳过代码高亮。");
    }

    // 2) KaTeX 自动渲染（若 KaTeX 与 auto-render 已加载）
    if (typeof window.renderMathInElement === "function") {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false
      });
    } else {
      console.warn("[main.js] KaTeX auto-render 未加载，跳过公式自动渲染。");
    }
  });
})();

// === 简历页语言切换（存在按钮时才生效） ===
(function () {
  function toggleLang(root) {
    const now = root.getAttribute("data-lang") || "zh";
    const next = now === "zh" ? "en" : "zh";
    root.setAttribute("data-lang", next);
    // 用 display 切换
    document.querySelectorAll(".lang-zh").forEach(el => el.style.display = (next === "zh") ? "block" : "none");
    document.querySelectorAll(".lang-en").forEach(el => el.style.display = (next === "en") ? "block" : "none");
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-toggle-lang]");
    if (!btn) return;
    const root = document.querySelector("main[data-lang]");
    if (root) toggleLang(root);
  });
  // 初始状态：按照 main[data-lang] 的值进行一次同步
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("main[data-lang]");
    if (!root) return;
    const lang = root.getAttribute("data-lang") || "zh";
    document.querySelectorAll(".lang-zh").forEach(el => el.style.display = (lang === "zh") ? "block" : "none");
    document.querySelectorAll(".lang-en").forEach(el => el.style.display = (lang === "en") ? "block" : "none");
  });
})();
