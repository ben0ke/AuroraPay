// AuroraPay main script.js

document.addEventListener("DOMContentLoaded", function () {
  highlightActiveLinks();
});

function highlightActiveLinks() {
  const currentPath = window.location.pathname;
  const selectors = [
    "custom-header a",
    "custom-navbar a",
    "custom-footer a",
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(link => {
      const href = link.getAttribute("href");
      if (href && (href === currentPath || (href !== "/" && currentPath.includes(href)))) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });
}
