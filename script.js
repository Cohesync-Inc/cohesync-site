// cohesync.com — page behaviour (mobile menu, contact form, footer year).
// Plain JavaScript, no build step. Loaded with `defer` from index.html.

// Where the contact form sends messages. This is the public contact endpoint on
// the Worklynq app (the old instance); change it here if that endpoint moves.
const CONTACT_ENDPOINT = "https://aura.worklynq.cohesync.net/api/v1/public/contact";

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
          name: data.name,
          email: data.email,
          company: data.company || undefined,
          message: data.message,
          website: data.website || "", // honeypot: real visitors leave this empty
        }),
      });
      let body = {};
      try {
        body = await res.json();
      } catch {
        body = {};
      }
      if (!res.ok || body.success === false) {
        return {
          ok: false,
          message:
            body.message ||
            (res.status === 429
              ? "Too many requests. Please try again in a few minutes."
              : "Could not send your message. Please try again."),
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
