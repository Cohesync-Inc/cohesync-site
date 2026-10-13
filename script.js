// cohesync.com — page behaviour (mobile menu, Worklynq feature carousel, contact form, footer year).
// Plain JavaScript, no build step. Loaded with `defer` from index.html.

// Where contact-form messages go: each one is emailed to CONTACT_EMAIL via FormSubmit
// (formsubmit.co), a free form-to-email service — no server needed.
//
// One-time setup: the FIRST message sent from cohesync.com triggers a "Confirm your
// email / Activate Form" email from FormSubmit to CONTACT_EMAIL. Click it once; from
// then on every message arrives as an email (Reply-To is the visitor's address).
// After activation FormSubmit also emails a random-string alias: put it in
// CONTACT_EMAIL instead of the address to keep the address out of the page source.
const CONTACT_EMAIL = "darvesh.taneja@cohesync.com";
const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_EMAIL;

/* ---------- Mobile menu ---------- */
(function mobileMenu() {
  const btn = document.querySelector(".mobile-menu-btn");
  const nav = document.getElementById("mobile-nav");
  const backdrop = document.querySelector(".mobile-nav-backdrop");
  if (!btn || !nav || !backdrop) return;
  const iconOpen = btn.querySelector(".icon-open");
  const iconClose = btn.querySelector(".icon-close");

  function setOpen(open) {
    nav.hidden = !open;
    backdrop.hidden = !open;
    // SVG elements have no .hidden property, so set the attribute directly
    iconOpen.toggleAttribute("hidden", open);
    iconClose.toggleAttribute("hidden", !open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  btn.addEventListener("click", () => setOpen(nav.hidden));
  backdrop.addEventListener("click", () => setOpen(false));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !nav.hidden) setOpen(false);
  });
  window.addEventListener("resize", () => {
    if (!nav.hidden && window.matchMedia("(min-width: 768px)").matches) setOpen(false);
  });
})();

/* ---------- Worklynq feature carousel ---------- */
(function featureCarousel() {
  const track = document.querySelector(".feature-carousel-track");
  if (!track) return;
  const prev = document.querySelector(".feature-carousel-prev");
  const next = document.querySelector(".feature-carousel-next");

  function step() {
    const card = track.querySelector(".feature-card");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 24;
    return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
  }

  function update() {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 8;
    next.disabled = track.scrollLeft >= max - 8;
  }

  prev.addEventListener("click", () => track.scrollBy({ left: -step() }));
  next.addEventListener("click", () => track.scrollBy({ left: step() }));
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

/* ---------- Contact form ---------- */
(function contactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  const card = form.closest(".contact-form-card");
  const title = card.querySelector(".contact-form-title");
  const success = card.querySelector(".contact-form-success");
  const error = form.querySelector(".contact-form-error");
  const submit = form.querySelector(".contact-form-submit");
  const fields = form.querySelectorAll("input:not(.contact-honeypot), textarea");
  let sending = false;

  function setSending(on) {
    sending = on;
    fields.forEach((f) => (f.disabled = on));
    submit.disabled = on;
    submit.textContent = on ? "Sending…" : "Send message";
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = !message;
  }

  async function send(data) {
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: data.name,
          Company: data.company || "—",
          Email: data.email,
          Message: data.message,
          "Sent from": "cohesync.com — Contact form",
          _replyto: data.email,
          _subject: "Cohesync website enquiry: " + data.name + (data.company ? " (" + data.company + ")" : ""),
          _template: "table",
          _captcha: "false",
          _honey: data.website || "", // honeypot: real visitors leave this empty
        }),
      });
      let body = {};
      try {
        body = await res.json();
      } catch {
        body = {};
      }
      // FormSubmit returns success as the string "true"/"false"
      if (!res.ok || String(body.success) !== "true") {
        return {
          ok: false,
          message:
            res.status === 429
              ? "Too many requests. Please try again in a few minutes."
              : "Could not send your message. Please try again in a moment.",
        };
      }
      return { ok: true };
    } catch {
      return { ok: false, message: "Network error. Please check your connection and try again." };
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;
    const fd = new FormData(form);
    const get = (k) => String(fd.get(k) || "").trim();
    const data = {
      name: get("name"),
      company: get("company"),
      email: get("email"),
      message: get("message"),
      website: get("website"),
    };
    showError("");
    setSending(true);
    try {
      const result = await send(data);
      if (!result.ok) {
        showError(result.message);
        return;
      }
      form.reset();
      form.hidden = true;
      title.hidden = true;
      success.hidden = false;
    } finally {
      setSending(false);
    }
  });
})();

/* ---------- Footer year ---------- */
document.querySelectorAll(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));
