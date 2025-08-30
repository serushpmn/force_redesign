const btn = document.getElementById("navToggle");
const nav = document.getElementById("primaryNav");
const overlay = document.getElementById("overlay");
const navList = nav.querySelector(".nav-list");
const themeBtn = document.getElementById("themeToggle");

// Theme helpers
const prefersDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeBtn) themeBtn.setAttribute("aria-pressed", "true");
  } else {
    document.documentElement.removeAttribute("data-theme");
    if (themeBtn) themeBtn.setAttribute("aria-pressed", "false");
  }
}

// initialize theme from localStorage or prefers-color-scheme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) applyTheme(savedTheme);
else applyTheme(prefersDark ? "dark" : "light");

themeBtn?.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});

// Mobile nav open/close
function openMenu() {
  if (!nav) return;
  nav.classList.add("open");
  overlay && overlay.classList.add("show");
  btn && btn.classList.add("active");
  btn && btn.setAttribute("aria-expanded", "true");
  // attach outside click handler after current call stack to avoid immediate close
  setTimeout(() => document.addEventListener("click", outsideClickHandler), 0);
}

function closeMenu() {
  if (!nav) return;
  nav.classList.add("closing");
  nav.classList.remove("open");
  overlay && overlay.classList.remove("show");
  btn && btn.classList.remove("active");
  btn && btn.setAttribute("aria-expanded", "false");
  document.removeEventListener("click", outsideClickHandler);
  setTimeout(() => nav.classList.remove("closing"), 350);
}

btn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (nav.classList.contains("open")) closeMenu();
  else openMenu();
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
  // pointer drag (mouse + touch) support
  (function enableDrag(el, onPrev, onNext) {
    let startX = null;
    let dragging = false;
    let pointerId = null;
    const THRESH = 40;

    el.addEventListener(
      "pointerdown",
      (ev) => {
        // only primary button
        if (ev.pointerType === "mouse" && ev.button !== 0) return;
        startX = ev.clientX;
        dragging = true;
        pointerId = ev.pointerId;
        el.setPointerCapture && el.setPointerCapture(pointerId);
      },
      { passive: true }
    );

    el.addEventListener(
      "pointermove",
      (ev) => {
        if (!dragging || startX === null) return;
        // optional: could implement drag preview
      },
      { passive: true }
    );

    function end(ev) {
      if (!dragging) return;
      const endX =
        ev.clientX !== undefined
          ? ev.clientX
          : ev.changedTouches &&
            ev.changedTouches[0] &&
            ev.changedTouches[0].clientX;
      const dx = endX - startX;
      if (Math.abs(dx) > THRESH) {
        dx > 0 ? onPrev() : onNext();
      }
      dragging = false;
      startX = null;
      try {
        el.releasePointerCapture && el.releasePointerCapture(pointerId);
      } catch (e) {}
      pointerId = null;
    }

    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  })(root, prev, next);

  // init
  render();
  start();
})();

// Trust slider is now handled by Swiper instance initialized earlier in this file.

(function initTrustSwiper() {
  if (typeof Swiper === "undefined") return; // Swiper not loaded yet
  const el = document.querySelector(".trustSwiper");
  if (!el) return;

  const trustSwiper = new Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    pagination: {
      el: el.querySelector(".swiper-pagination"),
      clickable: true,
      dynamicBullets: true,
    },
    navigation: {
      nextEl: el.querySelector(".swiper-button-next"),
      prevEl: el.querySelector(".swiper-button-prev"),
    },
  });

  const trustDesc = document.querySelector(".trust-desc");
  const trustTitleEl = trustDesc ? trustDesc.querySelector("h3") : null;
  const trustTextEl = trustDesc ? trustDesc.querySelector("p") : null;

  function updateDesc(swiper) {
    const idx = swiper.realIndex % swiper.slides.length;
    const slide =
      swiper.slides[swiper.realIndex + (swiper.loopedSlides || 0)] ||
      swiper.slides[swiper.realIndex];
    const title = slide?.dataset?.title || `نام و نام خانوادگی – شرکت`;
    const desc = slide?.dataset?.desc || `توضیحات مشتری`;
    if (trustTitleEl) trustTitleEl.textContent = title;
    if (trustTextEl) trustTextEl.textContent = desc;
  }

  trustSwiper.on("init", () => updateDesc(trustSwiper));
  trustSwiper.on("slideChange", () => updateDesc(trustSwiper));
  trustSwiper.init();
})();

// Products slider
document.addEventListener("DOMContentLoaded", function () {
  new Swiper(".prodSwiper", {
    direction: "horizontal",
    rtl: true, // برای RTL
    spaceBetween: 20,
    speed: 500,
    grabCursor: true,
    navigation: {
      nextEl: ".products .prod-nav.next",
      prevEl: ".products .prod-nav.prev",
    },
    // اگر می‌خواهی حلقه‌ای باشد فعال کن:
    // loop: true,

    // تعداد کارت‌ها در هر عرض
    breakpoints: {
      0: { slidesPerView: 1.05, spaceBetween: 14 },
      480: { slidesPerView: 1.6, spaceBetween: 16 },
      640: { slidesPerView: 2.1, spaceBetween: 18 },
      820: { slidesPerView: 3, spaceBetween: 20 },
      1100: { slidesPerView: 4, spaceBetween: 22 },
    },
  });
});

// Certificate Slider
document.addEventListener("DOMContentLoaded", function () {
  new Swiper(".certSwiper", {
    slidesPerView: 1.2,
    spaceBetween: 20,
    rtl: true,
    grabCursor: true,
    navigation: {
      nextEl: ".certificates .cert-nav.next",
      prevEl: ".certificates .cert-nav.prev",
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 14 },
      960: { slidesPerView: 3, spaceBetween: 18 },
      1280: { slidesPerView: 5, spaceBetween: 22 },
    },
  });
});

//Articles Section

document.addEventListener("DOMContentLoaded", function () {
  new Swiper(".articlesSwiper", {
    rtl: true,
    speed: 500,
    spaceBetween: 28,
    grabCursor: true,
    navigation: {
      nextEl: ".articles .art-nav.next",
      prevEl: ".articles .art-nav.prev",
    },
    breakpoints: {
      0: { slidesPerView: 1.05, spaceBetween: 16 },
      560: { slidesPerView: 2, spaceBetween: 22 },
      900: { slidesPerView: 3, spaceBetween: 26 },
      1240: { slidesPerView: 4, spaceBetween: 28 },
    },
  });
});
