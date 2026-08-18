# ARKADHATRI — Database Reference

MongoDB is the single source of truth. Every collection uses UUIDv4 `id` fields as the public identifier; `_id` (Mongo ObjectID) is never exposed.

On boot the app **creates indexes idempotently** (see `/app/app/api/[[...path]]/route.js` → `connectToMongo`). No migrations required for a fresh install.

---

## Collections

### `products`

Single source of truth for the catalogue. Managed via `/admin/products` and `/admin/inventory`.

| Field           | Type    | Notes                                            |
|-----------------|---------|--------------------------------------------------|
| `id`            | string  | UUIDv4, public identifier                        |
| `sku`           | string  | **Unique index**                                 |
| `slug`          | string  | URL slug                                         |
| `name`          | string  |                                                  |
| `tagline`       | string  |                                                  |
| `price`         | number  | in INR                                           |
| `comparePrice`  | number  | original list price (optional)                   |
| `stock`         | number  | atomic decrement on order creation               |
| `status`        | string  | `published` / `draft` / `hidden` / `out-of-stock`|
| `collection`    | string  | e.g. `silk-sarees`                               |
| `fabricType`    | string  |                                                  |
| `colourFamily`  | string  |                                                  |
| `colourName`    | string  |                                                  |
| `occasion`      | string[]|                                                  |
| `images`        | string[]| Hosted image URLs                                |
| `videoUrl`      | string  | Optional MP4/WebM/hosted URL                     |
| `videoPoster`   | string  | Optional poster image URL                        |
| `description`   | string  |                                                  |
| `details`       | object  | { Fabric, Colour, Occasion, Wash Care, … }       |
| `weave`         | string  |                                                  |
| `border`        | string  |                                                  |
| `sareeLength`   | string  |                                                  |
| `seoTitle`      | string  |                                                  |
| `seoDescription`| string  |                                                  |
| `metaKeywords`  | string  |                                                  |
| `tags`          | string[]|                                                  |
| `isNew` / `isBestseller` / `isTrending` / `isLimited` | boolean |                    |
| `createdAt`     | Date    |                                                  |
| `updatedAt`     | Date    |                                                  |

**Indexes:** `{ sku: 1 } unique`

### `orders`

Canonical record of a customer transaction. Backend is the source of truth.

| Field                 | Type    | Notes                                             |
|-----------------------|---------|---------------------------------------------------|
| `id`                  | string  | UUIDv4, **unique index**                          |
| `items`               | object[]| `{ sku, slug, name, price, qty, image }`          |
| `customer`            | object  | fullName, email, mobile, address1/2, city, state, pincode, paymentMethod |
| `subtotal`            | number  | Server-recomputed from DB prices                  |
| `shipping`            | number  |                                                   |
| `discount`            | number  |                                                   |
| `couponApplied`       | object  | `{ code, type, value, discount }` or `null`       |
| `total`               | number  | Final amount                                      |
| `currency`            | string  | Always `INR` in V1                                |
| `paymentMethod`       | string  | `razorpay` (V1)                                   |
| `paymentStatus`       | string  | `pending` / `paid` / `failed` / `refunded`        |
| `status`              | string  | See order state machine below                     |
| `stockReserved`       | boolean | true when items were atomically reserved          |
| `stockCommitted`      | boolean | true when payment captured                        |
| `razorpayOrderId`     | string  | Set when Razorpay order is created                |
| `razorpayPaymentId`   | string  | Set on verify or webhook                          |
| `paidAt`              | Date    |                                                   |
| `paymentFailedAt`     | Date    |                                                   |
| `paymentFailedReason` | string  |                                                   |
| `courier`             | string  | Admin-entered shipping fields                     |
| `awb`                 | string  |                                                   |
| `trackingUrl`         | string  |                                                   |
| `shipmentStatus`      | string  |                                                   |
| `shippedAt` / `outForDeliveryAt` / `deliveredAt` | Date  |                                     |
| `refundInitiatedAt` / `refundedAt` / `refundAmount` / `refundId` | mixed |                     |
| `createdAt`           | Date    |                                                   |
| `updatedAt`           | Date    |                                                   |

**Indexes:**
- `{ id: 1 } unique`
- `{ razorpayOrderId: 1 }`
- `{ "customer.email": 1 }`
- `{ "customer.mobile": 1 }`

### Order state machine

```
PAYMENT_PENDING  → PAID | PAYMENT_FAILED | CANCELLED
PAID             → PROCESSING | CANCELLED | REFUND_INITIATED
PROCESSING       → PACKED | CANCELLED | REFUND_INITIATED
PACKED           → SHIPPED | CANCELLED | REFUND_INITIATED
SHIPPED          → OUT_FOR_DELIVERY | DELIVERED | REFUND_INITIATED
OUT_FOR_DELIVERY → DELIVERED | REFUND_INITIATED
DELIVERED        → REFUND_INITIATED
REFUND_INITIATED → REFUNDED
PAYMENT_FAILED   → PAYMENT_PENDING | CANCELLED
```

Transitions are enforced server-side in `PUT /api/admin/orders/:id`.

### `coupons`

| Field         | Type    | Notes                                             |
|---------------|---------|---------------------------------------------------|
| `id`          | string  | UUIDv4                                            |
| `code`        | string  | Uppercase, **unique index**                       |
| `type`        | string  | `percentage` or `flat`                            |
| `value`       | number  |                                                   |
| `minPurchase` | number  | Optional                                          |
| `usageLimit`  | number  | Optional; `used` compared against this            |
| `used`        | number  | Incremented atomically on successful order        |
| `expiryDate`  | Date    | Optional                                          |
| `active`      | boolean |                                                   |
| `createdAt`   | Date    |                                                   |

### `webhook_events`

Idempotency guard for Razorpay webhooks.

| Field        | Type   | Notes                                                    |
|--------------|--------|----------------------------------------------------------|
| `eventId`    | string | Razorpay event id, **unique index** — duplicates are dropped |
| `event`      | string | e.g. `payment.captured`                                  |
| `payload`    | object | Raw payload                                              |
| `receivedAt` | Date   |                                                          |

### `newsletter`

| Field         | Type   | Notes                       |
|---------------|--------|-----------------------------|
| `email`       | string | Lowercased, **unique index**|
| `subscribedAt`| Date   |                             |

### `contact_messages`

Public contact-form submissions.

### `admin_settings`

Single-document boutique settings (business info, shipping, GST, etc.) managed at `/admin/settings`.

### `status_checks`

Legacy diagnostic collection; safe to ignore.

---

## Migrating existing data off Emergent

Use `mongodump` + `mongorestore`.

```bash
# 1. Dump from Emergent's MongoDB (run inside the Emergent container).
mongodump \
  --uri="$MONGO_URL" \
  --db="$DB_NAME" \
  --out=/tmp/arkadhatri-dump

# 2. Zip and download to your local machine.
tar czf arkadhatri-dump.tar.gz -C /tmp arkadhatri-dump
# Then copy off the container using your preferred method.

# 3. Restore to your production MongoDB (Atlas or self-hosted).
mongorestore \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net" \
  --nsFrom="<old-db>.*" \
  --nsTo="<new-db>.*" \
  /tmp/arkadhatri-dump
```

`mongorestore` does not overwrite existing indexes — they will be recreated by the app on next boot. **Do not delete existing data during the switchover.** Verify order counts, product counts and coupon counts match after restore.

### Cutover checklist

1. Freeze new orders on Emergent (put the boutique into maintenance mode by scaling the container to 0 briefly, or by temporarily removing the checkout button).
2. `mongodump` from Emergent, `mongorestore` into production.
3. Update Razorpay webhook URL in Razorpay Dashboard to the new domain.
4. Update DNS A/AAAA/CNAME to point at the new host.
5. Watch `/api/health` and `orders` collection for the first hour.

---

## Backups

At minimum:
- `mongodump` nightly.
- Retain 30 days.
- Store off-site (S3 with versioning, Backblaze B2, or Atlas snapshots on paid tier).

Orders and customer PII are the most sensitive data — encrypt backups at rest.
