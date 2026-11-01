/* ===== Config ===== */
// Put your real email here so the contact form can open your mail app
const EMAIL = "your.email@example.com";
const TYPED_WORDS = [
  "clean websites",
  "responsive interfaces",
  "Python projects",
  "creative web experiences",
];

/* ===== Helpers ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Theme toggle (remembers choice) ===== */
(function theme() {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved) root.setAttribute("data-theme", saved);
  $("#themeToggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

/* ===== Mobile menu ===== */
(function menu() {
  const btn = $("#menuBtn");
  const links = $("#navLinks");
  const close = () => {
    links.classList.remove("open");
    btn.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  };
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
  $$("a", links).forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());
})();

/* ===== Scroll: nav style, progress bar, active link ===== */
(function scrollEffects() {
  const nav = $("#nav");
  const bar = $("#scrollProgress");
  const sections = $$("main section[id]");
  const links = $$(".nav-links a");

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("scrolled", y > 20);
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    let current = sections[0].id;
    sections.forEach((s) => {
      if (y >= s.offsetTop - 140) current = s.id;
    });
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ===== Typing effect ===== */
(function typing() {
  const el = $("#typed");
  if (reduceMotion) { el.textContent = TYPED_WORDS[0]; return; }
  let w = 0, c = 0, deleting = false;
  function tick() {
    const word = TYPED_WORDS[w];
    el.textContent = word.slice(0, c);
    let delay = deleting ? 40 : 85;
    if (!deleting && c === word.length) { deleting = true; delay = 1600; }
    else if (deleting && c === 0) { deleting = false; w = (w + 1) % TYPED_WORDS.length; delay = 400; }
    c += deleting ? -1 : 1;
    setTimeout(tick, delay);
  }
  tick();
})();

/* ===== Reveal on scroll + skill bars + counters ===== */
(function reveal() {
  function animateCount(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("visible");
        $$(".skill", el).forEach((s) => ($(".fill", s).style.width = s.dataset.level + "%"));
        $$("[data-count]", el).forEach(animateCount);
        io.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 90 + "ms";
    io.observe(el);
  });
})();

/* ===== 3D tilt on the avatar ===== */
(function tilt() {
  const el = $("#tilt");
  if (!el || reduceMotion || window.matchMedia("(hover: none)").matches) return;
  const hero = $(".hero");
  hero.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  hero.addEventListener("mouseleave", () => (el.style.transform = ""));
})();

/* ===== Animated background (connected particles) ===== */
(function particles() {
  const canvas = $("#bgCanvas");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, dots;
  const mouse = { x: null, y: null };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    const count = Math.min(70, Math.floor((innerWidth * innerHeight) / 18000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35 * dpr, vy: (Math.random() - 0.5) * 0.35 * dpr,
      r: (Math.random() * 1.6 + 0.6) * dpr,
    }));
  }
  function color() {
    return getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#7c5cff";
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const col = color();
    const link = 140 * (window.devicePixelRatio || 1);
    dots.forEach((d, i) => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      for (let j = i + 1; j < dots.length; j++) {
        const o = dots[j];
        const dist = Math.hypot(d.x - o.x, d.y - o.y);
        if (dist < link) {
          ctx.globalAlpha = (1 - dist / link) * 0.35;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    });
    requestAnimationFrame(draw);
  }
  resize();
  addEventListener("resize", resize);
  draw();
})();

/* ===== Contact form (opens the visitor's mail app) ===== */
(function contact() {
  const form = $("#contactForm");
  const note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    let valid = true;

    [["name", name], ["email", /^\S+@\S+\.\S+$/.test(email)], ["message", message]].forEach(([id, ok]) => {
      const field = form[id].closest(".field");
      const good = typeof ok === "boolean" ? ok : ok.length > 0;
      field.classList.toggle("error", !good);
      if (!good) valid = false;
    });

    note.className = "form-note";
    if (!valid) {
      note.textContent = "Please fill in all fields with a valid email.";
      note.classList.add("err");
      return;
    }
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    note.textContent = "Thanks! Your email app should open now.";
    note.classList.add("ok");
    form.reset();
  });
  $$("input, textarea", form).forEach((i) =>
    i.addEventListener("input", () => i.closest(".field").classList.remove("error"))
  );
})();

/* ===== Footer year ===== */
$("#year").textContent = new Date().getFullYear();
