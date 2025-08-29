const btn = document.getElementById("navToggle");
const nav = document.getElementById("primaryNav");
const overlay = document.getElementById("overlay");
const navList = nav.querySelector(".nav-list");
const themeBtn = document.getElementById("themeToggle");

// Theme helpers
const prefersDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme");
function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === "dark") {
    html.setAttribute("data-theme", "dark");
    themeBtn?.setAttribute("aria-pressed", "true");
  } else {
    html.removeAttribute("data-theme");
    themeBtn?.setAttribute("aria-pressed", "false");
  }
}
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeBtn?.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});

function openMenu() {
  nav.classList.remove("closing");
  nav.classList.add("open");
  overlay.classList.add("show");
  btn.classList.add("active");
  btn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
  // attach outside click handler after current event loop to avoid immediate trigger
  setTimeout(() => {
    document.addEventListener("click", outsideClickHandler);
  }, 0);
}

function closeMenu() {
  nav.classList.remove("open");
  nav.classList.add("closing");
  overlay.classList.remove("show");
  btn.classList.remove("active");
  btn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  setTimeout(() => {
    nav.classList.remove("closing");
  }, 350);
  // remove outside click handler when menu closes
  document.removeEventListener("click", outsideClickHandler);
}

btn.addEventListener("click", () => {
  if (nav.classList.contains("open")) {
    closeMenu();
  } else {
    openMenu();
  }
});

overlay.addEventListener("click", (e) => {
  closeMenu();
});

// Close menu when clicking anywhere outside nav / toggle (useful when overlay doesn't cover header)
function outsideClickHandler(e) {
  // ignore clicks inside nav, on the toggle button, or on the theme button
  if (nav.contains(e.target)) return;
  if (btn.contains(e.target)) return;
  if (themeBtn && themeBtn.contains(e.target)) return;
  // if menu is open, close it
  if (nav.classList.contains("open")) closeMenu();
}

// Close menu when clicking outside nav (on overlay), but not when clicking inside nav
nav.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Optional: close menu when clicking a menu item (for single page apps)
navList.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    closeMenu();
  }
});

//Hero Section
(() => {
  const root = document.querySelector(".hero");
  const slides = Array.from(root.querySelectorAll(".hero__slide"));
  const prevBtn = root.querySelector(".hero__ctrl--prev");
  const nextBtn = root.querySelector(".hero__ctrl--next");
  const dotsWrap = root.querySelector("#heroDots");

  let i = 0,
    timer = null,
    hold = false;

  // دات‌ها
  slides.forEach((_, idx) => {
    const b = document.createElement("button");
    b.addEventListener("click", () => go(idx));
    dotsWrap.appendChild(b);
  });

  function render() {
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
    dotsWrap
      .querySelectorAll("button")
      .forEach((d, idx) => d.classList.toggle("is-active", idx === i));
  }

  function go(idx) {
    i = (idx + slides.length) % slides.length;
    render();
    restart();
  }
  const next = () => go(i + 1);
  const prev = () => go(i - 1);

  function start() {
    timer = setInterval(next, 6000);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }
  function restart() {
    if (!hold) {
      stop();
      start();
    }
  }

  // رویدادها
  nextBtn?.addEventListener("click", next);
  prevBtn?.addEventListener("click", prev);

  root.addEventListener("mouseenter", () => {
    hold = true;
    stop();
  });
  root.addEventListener("mouseleave", () => {
    hold = false;
    start();
  });

  // سوایپ موبایل
  let x0 = null;
  root.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), {
    passive: true,
  });
  root.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) dx > 0 ? prev() : next();
    x0 = null;
  });

  // init
  render();
  start();
})();
