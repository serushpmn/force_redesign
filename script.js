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
    document.addEventListener('click', outsideClickHandler);
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
  document.removeEventListener('click', outsideClickHandler);
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
function outsideClickHandler(e){
  // ignore clicks inside nav, on the toggle button, or on the theme button
  if (nav.contains(e.target)) return;
  if (btn.contains(e.target)) return;
  if (themeBtn && themeBtn.contains(e.target)) return;
  // if menu is open, close it
  if (nav.classList.contains('open')) closeMenu();
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
