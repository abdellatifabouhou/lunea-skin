# LUNÉA SKIN — Premium COD E-commerce System

Landing page + Cash-on-Delivery form + Google Apps Script API + Google Sheets order management.

---

# PART 1 — ARCHITECTURE

```
Ad (Meta / TikTok / Google)
        │
        ▼
Landing page  (Next.js, RTL, mobile-first)        https://luneaskin.ma
        │  Hero → Problem → Solution → Benefits → Ingredients → How-to → Trust → Offer → COD form
        ▼
submitOrder()  (browser)  — validates, locks button, POST JSON → /api/order
        │
        ▼
/api/order  (server route on the website — same origin, so NO CORS in the browser)
        │  re-validates, honeypot, rate-limit, forwards JSON (text/plain) server→server
        ▼
Google Apps Script Web App  (doPost)
        │  parse JSON → validateOrder → LockService → duplicate check
        │  → generateOrderId (LS-00001…) → price from Settings → total = qty × price → saveOrder
        ▼
Google Sheet "LUNÉA SKIN — COD Orders"
        ├── Orders    (15 columns, status dropdown, colours, filters)
        ├── Settings  (price, product, prefix, quantity range, timezone, duplicate window, API token)
        └── Dashboard (live formulas: totals, revenue, today, by city, last 7 days)
        │
        ▼
JSON  { success:true, orderId:"LS-00001" }  → customer sees confirmation → purchase event fired
```

**Why a same-origin proxy instead of calling Apps Script directly from the browser?**
Apps Script Web Apps (a) do not answer CORS pre-flight `OPTIONS` requests, (b) answer `POST` with a `302` redirect to `script.googleusercontent.com`, and (c) return no custom headers. Calling them from `fetch()` in the browser only works when the request is a "simple request" (`Content-Type: text/plain`, `redirect: "follow"`) and it still varies by browser/ad-in-app-browsers (Instagram/TikTok WebViews). A 20-line server route removes the whole class of problems and also keeps the Apps Script URL out of the public bundle. If you ever want to call Apps Script directly (pure static hosting), see PART 8-B.

**Preview fallback.** When `GOOGLE_SCRIPT_URL` is empty (this sandbox), `/api/order` stores orders in a small local PostgreSQL table with the exact same columns and logic (advisory lock, duplicate window, `LS-xxxxx` IDs) so the flow can be tested end to end. See `/admin/orders`. In production, set `GOOGLE_SCRIPT_URL` and the Google Sheet becomes the only store — no other database is used.

---

# PART 2 — PROJECT STRUCTURE

```
lunea-skin/
├── src/
│   ├── app/
│   │   ├── layout.tsx              SEO metadata, OG, fonts, analytics loader, RTL
│   │   ├── page.tsx                Landing page (all sections + JSON-LD + sticky CTA)
│   │   ├── globals.css             Palette (white / sage / beige / gold), buttons, reveal, reduced-motion
│   │   ├── sitemap.ts
│   │   ├── legal/[slug]/page.tsx   privacy · terms · shipping · refund (marked for legal review)
│   │   ├── admin/orders/page.tsx   Preview-only list of local fallback orders
│   │   └── api/
│   │       ├── order/route.ts      Validation + proxy → Apps Script (or preview store)
│   │       └── health/route.ts
│   ├── components/
│   │   ├── Navbar.tsx  Hero.tsx  Sections.tsx  OrderForm.tsx  Footer.tsx
│   │   ├── Analytics.tsx           GA4 / Meta / TikTok (loaded only when IDs are set)
│   │   └── Reveal.tsx              IntersectionObserver reveal + view_item
│   ├── lib/
│   │   ├── config.ts               brand, product, price (display), CTAs, messages
│   │   ├── validation.ts           shared validation + normalizePhone()
│   │   └── analytics.ts            trackViewItem / trackBeginCheckout / trackPurchase
├── public/robots.txt
├── apps-script/                    ← paste into Google Apps Script (PART 6)
│   ├── Code.gs        doPost / doGet / onOpen menu
│   ├── Config.gs      sheet names, headers, DEFAULT_SETTINGS, getSettings()
│   ├── Validation.gs  validateOrder()
│   ├── Orders.gs      getNextOrderNumber, generateOrderId, calculateTotal, findRecentDuplicate, saveOrder, createOrder_
│   ├── Utils.gs       jsonResponse, normalizePhone, dates, logging, formula-injection guard
│   ├── Setup.gs       setupProject() + sheet formatting + dashboard
│   ├── Tests.gs       runAllTests() (Tests 1–10)
│   └── appsscript.json
├── .env.example
└── README.md
```

---

# PART 3 — LANDING PAGE

Implemented in `src/app/page.tsx` + `src/components/*`:

| # | Section | Notes |
|---|---------|-------|
| 1 | Navbar | Logo, anchors, CTA, accessible mobile menu (Esc closes, body scroll lock) |
| 2 | Hero | Product, 4 benefits, 149 MAD badge, COD, "اطلب دابا", trust icons |
| 3 | Problem | Oily look · pores · acne marks · uneven tone |
| 4 | Solution | Serum as one simple routine step; cosmetic disclaimer |
| 5 | Benefits | 6 scannable cards, all "كيعاون على…" phrasing |
| 6 | Ingredients | Niacinamide, light texture, ease of use, routine fit — no invented % |
| 7 | How to use | 4 steps exactly as specified + patch-test tip |
| 8 | Before/After | Clearly-labelled placeholders — no fabricated results |
| 9 | Testimonials | "آراء العملاء سيتم إضافتها بعد إطلاق المنتج." |
| 10 | Showcase | Product facts (brand, type, active, price) |
| 11 | Offer | 149 MAD, COD, CTA, no fake discount/scarcity |
| 12 | COD form | See PART 4 |
| 13 | FAQ | Payment, delivery, usage, quantities |
| — | Footer | Contact, legal links, cosmetic disclaimer |
| — | Sticky mobile CTA bar | Price + "اطلب دابا" |

Images: no real product photos were provided, so two **illustrative renders** are used and labelled "صورة توضيحية" on the page. Replace `public/images/product-hero.jpg` / `product-texture.jpg` with real photos (same names) and remove the label in `Hero.tsx`/`Sections.tsx` when ready.

SEO: title/description/keywords, canonical, Open Graph, Twitter card, `Product` JSON-LD with `Offer` (MAD, 149), `sitemap.xml`, `robots.txt`, semantic `h1/h2`, alt texts, `lang="ar" dir="rtl"`.

Performance: Next.js image optimisation with `priority` only on the hero, lazy loading elsewhere, no UI libraries, fonts with `display=swap`, JS limited to the form/menu/reveal.

Accessibility: labels for every field, `aria-invalid` + `role="alert"` errors, `aria-busy` on submit, focus rings, skip link, keyboard-friendly menu & FAQ (`<details>`), `prefers-reduced-motion` honoured.

---

# PART 4 — COD FORM (`src/components/OrderForm.tsx`)

Fields: Full name · Phone (tel keypad, LTR) · City (datalist of Moroccan cities) · Quantity (− / + stepper, 1–10) · Address · Notes (optional) · hidden honeypot.

`submitOrder()` flow:
1. `validateOrder()` (shared module) → inline Darija errors, focus first invalid field.
2. `submittingRef` hard lock + disabled button → no double submission.
3. Loading spinner "جاري إرسال الطلب…".
4. `fetch("/api/order", {method:"POST", body: JSON})`.
5. Success → success card: **"شكراً ليك! تسجل الطلب ديالك بنجاح."** + **"رقم الطلب ديالك: LS-00001"** + total + COD note; form reset **only now**; `trackPurchase()` fired (not for duplicates).
6. Error → **"وقع مشكل أثناء إرسال الطلب. حاول مرة أخرى."** (server validation messages in Arabic are shown; technical errors never).
7. `begin_checkout` fires on first focus; `view_item` on page load.

Live total (qty × 149) is shown for UX only — the real total is computed server-side.

---

# PART 5 — GOOGLE SHEETS

You do **not** create tabs by hand — `setupProject()` does it. Steps:

1. Go to https://sheets.new (logged in with the brand's Google account).
2. Name the file **LUNÉA SKIN — COD Orders** (top-left).
3. Continue with PART 6. After running `setupProject()` you will have:

**Orders** — `Order ID | Date | Time | Full Name | Phone | City | Address | Product | Quantity | Unit Price | Total | Status | Notes | Source | User Agent`
frozen header, filter, widths, `yyyy-mm-dd`, `#,##0 "MAD"`, phone as text, Status dropdown (New/Confirmed/Shipped/Delivered/Cancelled) with colours.

**Settings** — `Key | Value | Description`:

| Key | Default |
|-----|---------|
| Brand Name | LUNÉA SKIN |
| Product Name | Niacinamide Serum |
| Product Price | 149 |
| Currency | MAD |
| Default Status | New |
| Order ID Prefix | LS- |
| Allowed Quantity | 1-10 |
| Timezone | Africa/Casablanca |
| Duplicate Window Minutes | 10 |
| API Token | *(empty = disabled)* |

Change the price here → the API uses the new price within 5 minutes (or run menu **LUNÉA SKIN → Clear settings cache**).

**Dashboard** — live formulas: Total / New / Confirmed / Shipped / Delivered / Cancelled orders, Total Revenue (Delivered), Potential Revenue (New+Confirmed+Shipped), Orders Today, Revenue Today, AOV, Delivery rate, Top cities (QUERY), last 7 days. Nothing hard-coded.

---

# PART 6 — GOOGLE APPS SCRIPT (complete code in `apps-script/`)

1. In the spreadsheet: **Extensions → Apps Script**. A project opens with `Code.gs`.
2. Delete the default content of `Code.gs` and paste `apps-script/Code.gs`.
3. Click **+ → Script** for each of: `Config`, `Utils`, `Validation`, `Orders`, `Setup`, `Tests` and paste the matching file.
4. **Project Settings (gear) → check "Show appsscript.json manifest"**, open `appsscript.json` and replace its content with `apps-script/appsscript.json` (sets the Casablanca timezone and Web App access).
5. Rename the project to **LUNÉA SKIN COD API**. Save (Ctrl/Cmd+S).

What each file does:

| File | Purpose |
|------|---------|
| `Code.gs` | `doPost(e)` — parses JSON (rejects malformed), calls `createOrder_`, always returns JSON, never a stack trace. `doGet` = health check. `onOpen` = spreadsheet menu. |
| `Config.gs` | `getSettings()` reads the Settings tab (cached 5 min). Headers/columns defined once. |
| `Validation.gs` | `validateOrder(data, settings)` — name, Moroccan phone (06/07/+212/00212), city, address, quantity within Settings range, product must equal Settings product, optional token, honeypot. |
| `Orders.gs` | `getNextOrderNumber()` (Script Properties counter, re-synced with sheet max — not row numbers) · `generateOrderId()` → `LS-00001` · `calculateTotal()` · `findRecentDuplicate()` · `saveOrder()` · `createOrder_()` wrapped in `LockService` (15 s wait). |
| `Utils.gs` | `jsonResponse`, `normalizePhone`, Arabic-digit normalisation, date/time in timezone, formula-injection guard (`=`, `+`, `-`, `@` prefixed cells), masked-phone logging. |
| `Setup.gs` | `setupProject()` — PART 7. |
| `Tests.gs` | `runAllTests()` — PART 10. |

Phone normalisation: `+212 6 12-34-56-78` → `0612345678`; `٠٦١٢٣٤٥٦٧٨` (Arabic digits) → `0612345678`; `05…` / landlines → rejected.

---

# PART 7 — SETUP FUNCTION

1. In the editor toolbar choose **`setupProject`** in the function dropdown → **Run**.
2. First run: **Review permissions → choose account → Advanced → Go to LUNÉA SKIN COD API (unsafe) → Allow**. (Normal for personal scripts — Google shows this for any non-verified script.)
3. Return to the spreadsheet: Dashboard / Orders / Settings tabs exist and are formatted. A **LUNÉA SKIN** menu appears (reload if not).

`setupProject()` is idempotent — re-run it anytime to repair formatting; it never overwrites existing Settings values or order rows.

---

# PART 8 — API INTEGRATION

## A. Recommended (implemented): Landing page → `/api/order` → Apps Script → Sheet

1. Deploy the Web App (PART 9, step 6) and copy the URL ending in `/exec`.
2. On the website host set the environment variable
   `GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec`
   (in `.env` locally; in Cloudflare Pages → Settings → Environment variables in production).
3. Optional shared secret: put a random string in Sheet **Settings → API Token** and the same string in `ORDER_API_TOKEN`. Apps Script rejects requests without it. (This is defence-in-depth, not real authentication — the URL is public by design.)

The server route sends `POST` with `Content-Type: text/plain;charset=utf-8`, `redirect: "follow"`, 20 s timeout, parses the JSON reply and returns it to the browser as `{success, orderId}` or `{success:false, error}`.

## B. Direct browser → Apps Script (only if you host as pure static files)

```js
const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
const res = await fetch(GOOGLE_SCRIPT_URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" }, // simple request → no OPTIONS preflight
  body: JSON.stringify(order),
  redirect: "follow",                                          // Apps Script replies 302
});
const data = await res.json();
```
Rules: never send `application/json` (triggers a preflight Apps Script can't answer), never set custom headers, deployment must be **Anyone**. This works in mainstream browsers but is more fragile in in-app browsers; option A is more reliable.

---

# PART 9 — DEPLOYMENT

The project is configured for **Cloudflare Pages (Next.js Static HTML Export)**. The public site is exported to `out/`, and the order API is handled by a Cloudflare Pages Function at `/api/order`, which forwards requests to the Google Apps Script Web App.

1. Deploy the Google Apps Script Web App and copy its `/exec` URL.
2. Push this repository to GitHub.
3. In Cloudflare: **Workers & Pages → Create application → Pages → Import an existing Git repository**.
4. Use these build settings:
   * Framework preset: **Next.js (Static HTML Export)**
   * Production branch: `main`
   * Build command: `npm run build`
   * Build output directory: `out`
   * Root directory: `/`
5. Add these environment variables in the Cloudflare Pages project:
   * `GOOGLE_SCRIPT_URL` (required)
   * `ORDER_API_TOKEN` (optional)
   * `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (optional)
   * `NEXT_PUBLIC_META_PIXEL_ID` (optional)
   * `NEXT_PUBLIC_TIKTOK_PIXEL_ID` (optional)
6. Deploy. The Pages Function is automatically deployed from `functions/`.
7. Connect `luneaskin.ma` under **Custom domains**. Configure `www` separately if you want it redirected to the apex domain.

Cloudflare's current documentation distinguishes static Next.js on Pages from full-stack Next.js on Workers; this repository intentionally keeps the existing Next.js frontend as a static export and places the required order endpoint in a Pages Function.

# PART 10 — TESTING CHECKLIST

Apps Script: run `runAllTests` (Tests.gs). Website (`/api/order`, with or without Sheets):

| # | Test | Command / Action | Expected |
|---|------|------------------|----------|
| 1 | Valid order | fill form, submit | success card, `LS-0000n`, row in sheet, Total = qty × 149 |
| 2 | Invalid phone `0512345678` | submit | "رقم الهاتف خاصو يكون…" / API `Invalid phone number` |
| 3 | Missing name | submit | rejected, focus on name |
| 4 | Missing city | submit | rejected |
| 5 | Quantity 0 | curl `"quantity":0` | 400 |
| 6 | Quantity 11 | curl `"quantity":11` | 400 |
| 7 | Invalid product | curl `"product":"Vitamin C"` | `Invalid product` |
| 8 | Malformed JSON | curl `-d '{"a":'` | `Invalid JSON` (400) |
| 9 | Double click | click submit twice fast | one order; second identical submission within 10 min returns the **same** ID with `duplicate:true` |
| 10 | Simultaneous | 3 curls with `&` | 3 distinct sequential IDs (LockService / advisory lock) |
| + | `+212` format | `"+212 612-345-678"` | saved as `0612345678` |
| + | Arabic digits | `"٠٦١٢٣٤٥٦٧٨"` | accepted |
| + | Honeypot filled | `"website":"x"` | fake success, nothing stored |

Example curl (local): `curl -X POST http://localhost:3000/api/order -H 'Content-Type: application/json' -d '{"fullName":"Ahmed Benali","phone":"0612345678","city":"Casablanca","address":"Maarif, Casablanca","quantity":1}'`

---

# PART 11 — TROUBLESHOOTING

| Symptom | Cause → Fix |
|---------|-------------|
| Browser console CORS error | You are calling Apps Script directly with `application/json` or custom headers. Use the `/api/order` proxy (default) or `text/plain` (PART 8-B). |
| `403` / HTML login page from Apps Script | Deployment access is not **Anyone**, or you used the `/dev` URL. Redeploy Web app with "Anyone" and use `/exec`. |
| `404` | Wrong/incomplete URL or deployment archived. Copy again from Manage deployments. |
| Changes in `.gs` don't apply | You edited code but did not create a **new version** in Manage deployments. |
| `Invalid JSON` on every request | Body isn't JSON (form-encoded) or double-stringified. Send `JSON.stringify(obj)` once. |
| `Settings sheet missing` | Run `setupProject()`. |
| Wrong price in sheet | Edit Settings → Product Price → menu **Clear settings cache** (or wait 5 min). |
| "Server busy" | LockService waited 15 s (rare burst). Customer can retry; duplicate protection prevents doubles. |
| Duplicate rows | Same phone with different quantity/product within window is *not* a duplicate by design. Increase "Duplicate Window Minutes" if needed. |
| Order IDs jumped | Counter re-synced from sheet max (rows pasted manually). Harmless; IDs remain unique. |
| Authorization popup keeps appearing | Grant permissions with the same account that owns the deployment; scripts in Shared Drives may need the owner to deploy. |
| Success in curl but form fails | `GOOGLE_SCRIPT_URL` env var not set on the host, or set without redeploying the site. |
| Dates off by one hour | Spreadsheet timezone ≠ script timezone. Run `setupProject` (sets both to Africa/Casablanca) and check `appsscript.json`. |
| Preview `/admin/orders` empty in production | Expected — production writes to the Sheet, not the preview table. |

---

# PART 12 — SECURITY CHECKLIST

- [x] Google Sheet is private — share **only** with the team (Editor for ops, Viewer for others). Never "Anyone with the link". Do **not** publish to web.
- [x] No Google credentials, sheet IDs or service accounts in the frontend. The browser only knows `/api/order`; the Apps Script URL is a server env var.
- [x] Price and product taken **only** from Settings; total computed server-side.
- [x] Server-side validation of every field; Arabic-digit and `+212` normalisation.
- [x] Malformed JSON, missing fields, wrong types → clean JSON error, HTTP 400; unexpected errors → generic message, details only in logs.
- [x] Logs mask phone numbers (`06****5678`); no addresses logged.
- [x] Formula-injection guard on all text cells (`=`, `+`, `-`, `@`).
- [x] Honeypot field, per-IP rate limit (20/min, best-effort), optional shared `API Token`, 10-minute duplicate window, `LockService` for unique IDs.
- [x] Analytics receive only product/value/order-id — never name, phone or address.
- [x] `robots.txt` disallows `/admin` and `/api`; legal pages `noindex`.
- [ ] Add Cloudflare WAF rate-limiting rule on `/api/order` (e.g. 10 req / min / IP) — free tier supports this.
- [ ] Enable 2-Step Verification on the Google account that owns the Sheet and script.
- [ ] Periodically export & purge old orders according to your data-retention policy (Loi 09-08).

**Honest limitations of Apps Script Web Apps:** the endpoint must be public ("Anyone") to receive anonymous orders, so it can be called by anyone who discovers it; there is no IP-based rate limiting inside Apps Script; quotas apply (~20k URL fetches/day, 6 min execution). The proxy + token + honeypot + duplicate window + Cloudflare rules make abuse impractical for an MVP, but the system is not "100 % secure" — nothing is.

---

# PART 13 — PRODUCTION CHECKLIST

- [ ] Landing page works on `https://luneaskin.ma` (HTTPS, canonical)
- [ ] Mobile responsive (test iPhone Safari + Android Chrome + Instagram in-app browser)
- [ ] COD form works end to end, success card shows Order ID
- [ ] Google Apps Script deployed as Web app (Anyone / Execute as Me), `/exec` URL used
- [ ] Google Sheet receives orders with Date/Time in Casablanca time
- [ ] Order IDs sequential and unique (`LS-00001` …)
- [ ] Price calculated server-side (change Settings price → verify)
- [ ] Validation works (Tests 2–8)
- [ ] Duplicate protection works (Test 9)
- [ ] Dashboard updates automatically
- [ ] GA4 `purchase` visible in DebugView; Meta `Purchase` and TikTok `PlaceAnOrder` in test events
- [ ] Pixel IDs & `GOOGLE_SCRIPT_URL` set in Cloudflare env vars (not in code)
- [ ] SEO metadata / OG image / sitemap / robots verified (Rich Results test for Product)
- [ ] Legal pages reviewed by a legal advisor; placeholders in [brackets] replaced
- [ ] Real product photos replace the illustrative renders; "صورة توضيحية" labels removed
- [ ] Support phone set in `src/lib/config.ts` (`contactPhone`)
- [ ] Sheet sharing audited; 2FA enabled
- [ ] Cloudflare Pages deployed with custom domain + WAF rule on `/api/order`
- [ ] Production test order completed, then marked **Cancelled** or deleted

---

## Local development

```bash
cp .env.example .env      # fill in values (or leave GOOGLE_SCRIPT_URL empty for preview mode)
npm install
npm run dev
```

## Cloudflare Pages deployment (current project setup)

This project is configured as a **Next.js Static HTML Export** for Cloudflare Pages. The landing page and legal pages are generated into `out/`, while the order endpoint runs as a Cloudflare Pages Function at `/api/order` and forwards orders to the configured Google Apps Script URL.

Cloudflare Pages settings:
- Framework preset: **Next.js (Static HTML Export)**
- Build command: `npm run build`
- Build output directory: `out`
- Root directory: `/`

Required Pages environment variables:
- `GOOGLE_SCRIPT_URL`
- `ORDER_API_TOKEN` (optional)
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_META_PIXEL_ID` (optional)
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID` (optional)
