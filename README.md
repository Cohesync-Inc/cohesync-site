# cohesync.com

The Cohesync company website. Plain HTML, CSS and JavaScript — no build step, no framework. GitHub Pages serves this repository's `main` branch as-is at **cohesync.com** (set by the `CNAME` file), the same way `worklynq-site` serves worklynq.com.

## Files

| File | What it is |
|---|---|
| `index.html` | All page content, top to bottom: header, hero, products (WPM / PSA), vision, philosophy, manifesto, contact, footer. Each part is a `<section>` with an `id` you can search for. |
| `styles.css` | All styling. Mostly short utility classes plus named component classes (`.section-hero`, `.product-card`, `.contact-form-card`, …). |
| `script.js` | The only behaviour on the page: mobile menu, contact form, footer year. |
| `assets/` | Logos, hero and product images. |
| `CNAME` | Tells GitHub Pages to serve this site at cohesync.com. Don't delete it. |
| `.nojekyll` | Tells GitHub Pages to serve files exactly as they are. |

## Making a change

1. Edit `index.html` (text and images) or `styles.css` (look) — on GitHub's web editor or locally.
2. To check locally, run `python3 -m http.server` in this folder and open http://localhost:8000.
3. Commit to `main`. GitHub Pages republishes in a minute or two.

Common edits:
- **Text:** search `index.html` for the sentence and change it.
- **Images:** drop the file in `assets/` and point the `<img src>` at it.

## Contact form

Messages from the contact form are **emailed to darvesh.taneja@cohesync.com** via [FormSubmit](https://formsubmit.co), a free form-to-email service. The address is set once at the top of `script.js` (`CONTACT_EMAIL`). Each email has the subject "Cohesync website enquiry: ‹name› (‹company›)", a table of the fields, and Reply-To set to the visitor's address.

**One-time activation:** the first message ever sent from cohesync.com triggers an "Activate Form" email from FormSubmit to that address. Click it once; until then messages are not delivered and visitors see "Could not send your message". After activation FormSubmit emails a random-string alias, which can replace the address in `CONTACT_EMAIL` to keep it out of the page source.

## History

The site was originally a React/Vite app built and hosted on an AWS EC2 server (`13.216.4.43`) by the previous contractor; only the compiled output was recovered (commit "Import built cohesync.com site from AWS EC2"). In October 2026 it was rebuilt from that output into this plain source and checked against the original: identical rendering at desktop and phone widths, and identical tab, menu and contact-form behaviour. The Cannonball Digital Works services section was removed afterwards (October 2026).
