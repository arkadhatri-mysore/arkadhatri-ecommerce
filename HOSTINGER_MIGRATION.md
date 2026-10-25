# ARKADHATRI — Hostinger (managed Node.js) migration guide

This package contains the website source only. It contains **no** `.env`, secrets, passwords, logs,
orders, customers, subscribers, contact messages, admin accounts, sessions, `.git`, `node_modules` or
build caches. Payments stay **off** (WhatsApp-enquiry mode) until Razorpay keys are added.

## 1. What runs where

| Piece | Where it lives on Hostinger |
|---|---|
| Website + API (Next.js 15, `output: 'standalone'`) | Hostinger managed Node.js app, Node **20.9+** (choose Node 20 or 22) |
| Database (products, settings, orders, admin login, codes, attempt limits) | **External MongoDB** — e.g. MongoDB Atlas, region **Mumbai (ap-south-1)**. Hostinger does not provide MongoDB and the app's local disk is not a database. |
| Uploaded photos / videos (Admin → product photos, hero photo) | Stored **inside MongoDB** (GridFS bucket `media`) and served from `/api/media/...`. Nothing is written to the server disk, so redeploys do not lose media. Back up the database = back up the media. |
| Placeholder photos | External Unsplash/Pexels links (replace with your own via Admin). |
| Logo | `public/brand/*.svg` (in the source). |

## 2. Hostinger settings

- Framework: Next.js (or "Other / custom Node.js")
- Node version: 20.x or 22.x
- Install: `npm install` (or `yarn install` — `yarn.lock` is included)
- Build: `npm run build`  → runs `next build` then copies `public/` and `.next/static` into `.next/standalone`
- Start: `npm start`  → `node .next/standalone/server.js` (uses Hostinger's `PORT`)
- Output directory (if asked): `.next`

## 3. Environment variables (set in hPanel → Environment variables; names only)

Required:
`MONGO_URL`, `DB_NAME`, `NODE_ENV` (= production), `NEXT_PUBLIC_BASE_URL`, `SITE_URL`, `NEXT_PUBLIC_SITE_URL`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD` (one-time starter password), `ADMIN_JWT_SECRET` (new random 64-hex),
`TRUSTED_PROXY_HOPS`, `FRAME_ANCESTORS` (= 'self'), `CORS_ORIGINS` (= your https domain)

Recommended / shop:
`ORDER_ACCESS_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_WHATSAPP_DISPLAY`, `SHIPPING_FLAT_RATE`, `SHIPPING_FREE_ABOVE`

Email (needed for order-view codes, password reset, order emails — these fail closed until set):
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_REPLY_TO`

Payments (leave **blank** until Razorpay KYC is approved and tested):
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Optional:
`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_LOGO_URL`, `NEXT_PUBLIC_HERO_VIDEO_URL`, `NEXT_PUBLIC_CRAFT_VIDEO_URL`
(Analytics/ads IDs are better set in Admin → Settings; they load only after visitor consent.)

Notes:
- `NEXT_PUBLIC_*` values are baked in at **build** time — set them before building, rebuild after changing.
- Never set `MAIL_TRANSPORT` in production (test-only, ignored when `NODE_ENV=production`).
- `TRUSTED_PROXY_HOPS`: number of proxies in front of the app that append to `X-Forwarded-For`.
  Start with `1` on Hostinger (add 1 more if you put Cloudflare in front). Use `0` if unsure (header ignored; limits become shared).
- Generate secrets on your own computer, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## 4. Database & media migration

1. Create a MongoDB Atlas cluster (Mumbai), a database user with a strong password, and allow Hostinger's outbound IP
   (or 0.0.0.0/0 with a strong password if Hostinger has no fixed IP). Copy the `mongodb+srv://` string into `MONGO_URL`.
2. Import the shop catalogue included in this package (`data/catalog-export/`: 13 products + non-secret shop settings; no customer data):
   `MONGO_URL="..." DB_NAME="arkadhatri" npm run import:catalog`
   (Run from your computer or Hostinger SSH. Safe to re-run.) If the database is left empty, the site seeds the built-in sample catalogue automatically.
3. Uploaded media: none of the uploads on the old preview were in use (only test files), so none are included.
   Upload your real photos/videos through Admin after launch; they are stored in the database.
4. Not migrated on purpose: orders, customers, newsletter, contact messages, admin login, reset tokens, codes, attempt counters.
   The admin account is recreated on first sign-in from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
5. Backups: enable Atlas backups (this also backs up all uploaded media).

To re-export the catalogue later from any database: `MONGO_URL=... DB_NAME=... npm run export:catalog`.

## 5. Launch checklist (owner)

1. Set all required env vars with **fresh** secrets (new `ADMIN_JWT_SECRET`, new starter `ADMIN_PASSWORD`, new Atlas password).
2. Build & start; open `/api/health` → `db: "up"`.
3. Sign in at `/admin`, immediately change the password (Settings → Security). Then remove `ADMIN_PASSWORD` from hPanel and restart.
4. Connect your domain + SSL in hPanel; set `SITE_URL` / `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_BASE_URL` to it and rebuild (this turns on indexing, sitemap and canonical links).
5. Add SMTP details, then test "Forgot password" and Track Order codes.
6. Replace sample photos and confirm product fabric claims; complete address/GSTIN and policy text.
7. Later: Razorpay live keys + webhook `https://<your-domain>/api/webhooks/razorpay`, test a real payment, then payments switch on automatically.
8. Search Console / Merchant Center (feed: `/api/feed/products.csv`), Meta / Google Ads IDs in Admin → Settings.
