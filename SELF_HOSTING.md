# ARKADHATRI — Self-Hosting Guide

This guide moves ARKADHATRI from Emergent hosting to your own infrastructure
(bare metal, a VPS such as Hetzner / DigitalOcean, or a container platform such
as Vercel + MongoDB Atlas, Railway, or Fly.io).

**The app is a single Next.js 15 application** — there is no separate backend
service. All API routes live under `/app/api/[[...path]]/route.js`.

---

## 1. Required software

| Tool                 | Version              | Purpose                           |
|----------------------|----------------------|-----------------------------------|
| Node.js              | **>= 18.18** (20 LTS recommended) | Next.js 15 runtime  |
| Yarn (Classic 1.x)   | 1.22+                | Package manager                   |
| MongoDB              | **6.0+**             | Database                          |
| A TLS certificate    | Let’s Encrypt or paid | HTTPS in production              |

> **Note:** Python is **not** required. There is no separate Python service.

Optional but recommended:

- **MongoDB Atlas** (managed): free tier is enough to start; upgrade to a paid tier before real traffic.
- **A reverse proxy** (nginx, Caddy, or a platform edge like Vercel/Cloudflare) that terminates TLS and forwards to Next.js.

---

## 2. Clone & install

```bash
git clone <your-fork-url> arkadhatri
cd arkadhatri
yarn install --frozen-lockfile
```

---

## 3. Environment variables

```bash
cp .env.example .env
# Edit .env and fill in every value marked required.
```

The application reads `.env` at boot. See `.env.example` for the exhaustive list.
Key variables to set in **production**:

- `MONGO_URL` — e.g. `mongodb+srv://user:pass@cluster.mongodb.net`
- `DB_NAME` — e.g. `arkadhatri`
- `NEXT_PUBLIC_BASE_URL` — e.g. `https://arkadhatri.com`
- `CORS_ORIGINS` — e.g. `https://arkadhatri.com,https://www.arkadhatri.com`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — **change from defaults**
- `ADMIN_JWT_SECRET` — fresh 32-byte hex
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — same as `RAZORPAY_KEY_ID`
- `SMTP_*` — SMTP provider details for order emails
- `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` — analytics

---

## 4. Development

```bash
yarn dev        # http://localhost:3000
```

---

## 5. Production build & start

```bash
yarn build
yarn start      # binds to 0.0.0.0:3000 by default
```

Run under a process manager: `pm2`, `systemd`, Docker, or your platform’s
provided supervisor. Example `pm2`:

```bash
yarn build
pm2 start "yarn start" --name arkadhatri --time
pm2 save
```

Example `systemd` unit:

```ini
# /etc/systemd/system/arkadhatri.service
[Unit]
Description=ARKADHATRI Next.js
After=network.target mongodb.service

[Service]
Type=simple
User=arkadhatri
WorkingDirectory=/opt/arkadhatri
EnvironmentFile=/opt/arkadhatri/.env
ExecStart=/usr/bin/yarn start
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

---

## 6. Reverse proxy

A minimal nginx config for `arkadhatri.com`:

```nginx
server {
  listen 443 ssl http2;
  server_name arkadhatri.com www.arkadhatri.com;

  ssl_certificate     /etc/letsencrypt/live/arkadhatri.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/arkadhatri.com/privkey.pem;

  # Razorpay webhook MUST reach us with the raw body intact.
  # nginx passes bodies through unchanged by default — leave this alone.
  client_max_body_size 10m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}

server { listen 80; server_name arkadhatri.com www.arkadhatri.com; return 301 https://$host$request_uri; }
```

---

## 7. Health check

`GET /api/health` returns a safe JSON snapshot:

```json
{
  "ok": true,
  "service": "arkadhatri-api",
  "version": "v1",
  "time": "2025-08-...",
  "db": "up",
  "integrations": {
    "razorpay": true,
    "razorpayWebhook": true,
    "smtp": true,
    "ga4": true,
    "metaPixel": true
  }
}
```

Use this in your platform’s liveness/readiness probes. It does **not** expose secrets, database credentials, or PII.

---

## 8. Razorpay configuration

1. In your Razorpay Dashboard, create an API key (Test or Live). Copy `key_id` and `key_secret` into `.env`.
2. In Dashboard → **Webhooks**, add a new webhook:
   - URL: `https://arkadhatri.com/api/webhooks/razorpay`
   - Secret: any strong string — paste the same value into `RAZORPAY_WEBHOOK_SECRET`.
   - Events: `payment.captured`, `payment.authorized`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`, `payment.dispute.created`.
3. Restart the app after updating `.env`.
4. Verify: place one test payment; check that `orders` collection transitions `PAYMENT_PENDING → PAID` and that a `webhook_events` document exists.

> The verify endpoint always uses the **server-stored** `razorpayOrderId` for HMAC — the browser cannot tamper with the order the signature is checked against.

---

## 9. Admin account

The admin login lives at `/admin`. Credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. After first login, close the terminal, change `ADMIN_PASSWORD` in the environment, and redeploy.

---

## 10. Custom domain

At no point should you edit code to change the domain. Only the following environment variables are domain-aware:

- `NEXT_PUBLIC_BASE_URL`
- `CORS_ORIGINS`

Also update the Razorpay webhook URL in the Razorpay Dashboard to use the new domain.

---

## 11. Media files

Product images and videos are stored **as URLs** in the `products` collection (fields: `images: ["https://..."]`, `videoUrl`, `videoPoster`). There are no binary uploads. Any public CDN (S3 + CloudFront, Cloudflare R2, Bunny CDN, Cloudinary) works — upload the file elsewhere and paste the URL into the admin product editor.

The app’s built-in fallback logo lives on the Emergent CDN. To fully break that dependency, set `NEXT_PUBLIC_LOGO_URL` to your own hosted logo.

---

## 12. Database migration

See `DATABASE.md` for the full schema and migration procedure.

---

## 13. What to remove from Emergent-specific setup

When you exit Emergent:

- Nothing in the source code needs to be touched — the app is portable.
- The `.emergent/` folder and `supervisord.conf` are Emergent artefacts. You can delete them; they aren’t required for self-hosting.
- All configuration is via `.env` — no hard-coded Emergent URLs remain in customer-facing code.

---

## 14. Backup & DR

- **MongoDB Atlas** provides automated snapshots on paid tiers.
- If self-hosting Mongo, run `mongodump` daily and rotate weekly.
- Environment secrets should be stored in your platform’s secret manager, not committed to git.
