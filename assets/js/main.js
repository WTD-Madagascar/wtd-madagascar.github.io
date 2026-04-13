(function () {
  "use strict";

  const base = typeof window.BASE_PATH === "string" ? window.BASE_PATH : "";

  if (typeof window.BASE_PATH === "undefined") {
    console.warn("BASE_PATH non défini. basepath.js est-il chargé ?");
    window.BASE_PATH = "";
  }

  const css = document.querySelector("link[data-main-css]");
  if (css) {
    css.href = base + "assets/css/main.css";
  }

  function resolveHref(target) {
    if (!target) return "#";

    if (
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      target.startsWith("tel:") ||
      target.startsWith("#")
    ) {
      return target;
    }

    return base + target.replace(/^\/+/, "");
  }

  document.querySelectorAll("a[data-href]").forEach((link) => {
    link.setAttribute("href", resolveHref(link.dataset.href));
  });

  const current = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".site-nav a[data-href], .site-nav a[href]").forEach((link) => {
    const raw = link.dataset.href || link.getAttribute("href") || "";
    const target = raw.split("/").pop();

    if (target === current) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      document.body.classList.add("user-is-tabbing");
    }
  });

  document.addEventListener("mousedown", () => {
    document.body.classList.remove("user-is-tabbing");
  });
})();
