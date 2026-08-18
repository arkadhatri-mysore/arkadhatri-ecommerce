#====================================================================================================
# ARKADHATRI — FINAL LAUNCH HARDENING PASS
#====================================================================================================
#
# CRITICAL TESTING RULES FOR ALL AGENTS (do not modify):
# 1. Backend must be tested BEFORE frontend.
# 2. Do NOT retest a task that has been marked working: true and needs_retesting: false unless
#    the main agent has changed the underlying files.
# 3. The backend testing agent should read admin credentials from /app/memory/test_credentials.md.
#
#====================================================================================================

user_problem_statement: |
  ARKADHATRI final production launch completion. New behaviour requires validation:

  1. POST /api/orders now
     - Requires ALL customer fields (fullName, email, mobile, address1, city, state, pincode).
     - Recomputes subtotal SERVER-SIDE from products collection (client price is ignored).
     - Applies coupon SERVER-SIDE (never trusts client discount).
     - ATOMICALLY reserves stock via findOneAndUpdate with { stock: {$gte: qty} } filter.
       Rolls back reservations if any SKU is insufficient (returns 409 STOCK_UNAVAILABLE).
     - Creates order in status='PAYMENT_PENDING', paymentStatus='pending',
       stockReserved=true, stockCommitted=false.
     - Immediately calls Razorpay to create a live razorpay order if keys are present.
       Returns { payment: { mocked: false, keyId, razorpayOrderId, amount } } for client.
     - When keys are absent returns { payment: { mocked: true } }.
     - Increments coupons.used by 1 when a valid code applied.

  2. POST /api/payments/razorpay/verify
     - Idempotent: if order already paid, returns { ok: true, already: true }.
     - HMAC verifies signature using RAZORPAY_KEY_SECRET.
     - Atomically transitions PAYMENT_PENDING -> PAID via findOneAndUpdate filter.
     - Sets stockCommitted=true, paidAt=now.
     - In mocked mode (no key) DOES NOT mark PAID — order stays PAYMENT_PENDING.

  3. POST /api/webhooks/razorpay
     - Rejects when RAZORPAY_WEBHOOK_SECRET is not configured (503).
     - Verifies HMAC using raw request body vs x-razorpay-signature header.
     - IDEMPOTENT via unique index on webhook_events.eventId (duplicate → { ok:true, duplicate:true }).
     - payment.captured (or order.paid) event: PAYMENT_PENDING -> PAID + email sent.
     - payment.failed event: releases reserved stock, sets status=PAYMENT_FAILED.

  4. POST /api/orders/track
     - Requires orderId + identifier (email OR last-10-digits of mobile).
     - Returns REDACTED order view (no address, no email leak in response body's customer field).
     - Rate limited (12/min per IP).

  5. PUT /api/admin/orders/:id
     - Validates state transitions via /app/lib/orders.js state machine.
     - Accepts shipping fields: courier, awb, trackingUrl, shipmentStatus.
     - Setting status=SHIPPED sends order-shipped email (if SMTP configured; else skipped silently).
     - Setting status=DELIVERED sends order-delivered email.
     - Setting status=REFUNDED also sets paymentStatus=refunded and refundedAt.

  6. Coupons — POST /api/coupons/validate
     - Public endpoint, unchanged semantically but now rate-limited (20/min).

  7. Admin dashboard revenue now only sums orders where paymentStatus='paid'.

backend:
  - task: "Order creation with server-side pricing + atomic stock reservation + optional Razorpay init"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "critical"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Rewritten POST /api/orders. Key behaviours:
          * Rejects with 400 if any of these customer fields is missing: fullName, email, mobile, address1, city, state, pincode.
          * Recomputes subtotal from products in DB — ignores client's price/subtotal.
          * Reserves stock atomically per SKU (rolls back all reservations on any failure; returns 409 STOCK_UNAVAILABLE).
          * Creates order in status='PAYMENT_PENDING', paymentStatus='pending', stockReserved=true, stockCommitted=false.
          * Applies coupon on server; increments coupons.used only after successful reservation.
          * Returns { ok:true, order, payment:{mocked:true} } when Razorpay keys absent (current state).
  - task: "Razorpay verify — idempotent + atomic PAYMENT_PENDING->PAID transition"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "critical"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Idempotency check first; returns { ok:true, already:true } if order already paid.
          Without keys, does NOT mark PAID (keeps PAYMENT_PENDING) — tests should assert this.
          With keys, HMAC-verifies signature and does an atomic findOneAndUpdate
          filtered on paymentStatus='pending'.
  - task: "Razorpay webhook — signature verify + idempotent event handling"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "critical"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Route: POST /api/webhooks/razorpay. Uses raw request text for HMAC.
          When RAZORPAY_WEBHOOK_SECRET is absent (as in the current run), returns 503 — tests
          should expect 503, NOT a signature check.
          Uses unique index on webhook_events.eventId for idempotency.
  - task: "Order tracking endpoint (customer, redacted, rate-limited)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          POST /api/orders/track { orderId, identifier }. Identifier is email OR mobile.
          Mobile match compares only the last 10 digits (normalises +91 / spaces).
          Returns REDACTED order (no full address or email echo). 404 with generic message on mismatch.
  - task: "Admin order update — state transition validation + shipping fields + emails"
    implemented: true
    working: "NA"
    file: "lib/admin-api.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          PUT /api/admin/orders/:id now validates transitions via canTransition().
          Accepts courier, awb, trackingUrl, shipmentStatus, pickupAddress, shippingNotes.
          Sends order-shipped / delivered emails when status transitions cross those thresholds
          (silently no-ops if SMTP is not configured).
  - task: "Coupon validate + Newsletter + Contact still work with rate limiting"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Existing endpoints retained; now rate-limited (in-memory sliding window). Verify a
          normal single-shot request still succeeds.
  - task: "Admin dashboard revenue sums only PAID orders"
    implemented: true
    working: "NA"
    file: "lib/admin-api.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Changed dashboard aggregate to $match paymentStatus:'paid' before summing $total.

frontend:
  - task: "Razorpay Checkout client flow (loads only when NEXT_PUBLIC_RAZORPAY_KEY_ID present)"
    implemented: true
    working: "NA"
    file: "app/checkout/page.js"
    stuck_count: 0
    priority: "critical"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Do NOT run frontend testing without explicit user confirmation."
  - task: "Order-success page reflects PAID / PAYMENT_PENDING / PAYMENT_FAILED and fires purchase once"
    implemented: true
    working: "NA"
    file: "app/order-success/[id]/page.js, components/Analytics.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Track Order page (customer)"
    implemented: true
    working: "NA"
    file: "app/track-order/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Admin orders — shipping fields + state transition dropdown"
    implemented: true
    working: "NA"
    file: "app/admin/orders/page.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
  - task: "GA4 + Meta Pixel analytics (env driven, no-op when not configured)"
    implemented: true
    working: "NA"
    file: "components/Analytics.js, app/providers.js, app/product/[slug]/page.js, app/checkout/page.js, app/order-success/[id]/page.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

metadata:
  created_by: "main_agent"
  version: "3.0"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus:
    - "Order creation with server-side pricing + atomic stock reservation + optional Razorpay init"
    - "Razorpay verify — idempotent + atomic PAYMENT_PENDING->PAID transition"
    - "Razorpay webhook — signature verify + idempotent event handling"
    - "Order tracking endpoint (customer, redacted, rate-limited)"
    - "Admin order update — state transition validation + shipping fields + emails"
    - "Coupon validate + Newsletter + Contact still work with rate limiting"
    - "Admin dashboard revenue sums only PAID orders"
  stuck_tasks: []
  test_all: false
  test_priority: "critical_first"

agent_communication:
  - agent: "main"
    message: |
      This is the final launch hardening pass. Please test the endpoints in the test_plan.
      Admin credentials: admin@arkadhatri.com / ArkAdmin@2025 (/app/memory/test_credentials.md).

      IMPORTANT ENVIRONMENT CONTEXT:
        RAZORPAY_KEY_ID       — NOT set (mocked mode)
        RAZORPAY_KEY_SECRET   — NOT set
        RAZORPAY_WEBHOOK_SECRET — NOT set
        SMTP_*                — NOT set (email is a silent no-op)
      Do NOT expect live Razorpay behaviour; expect mocked responses.

      CRITICAL SCENARIOS:

      A) Order creation server-side pricing + atomic reservation:
        1. Login as admin. Pick a product from GET /api/admin/products. Note its stock (S) and price (P).
        2. Call PATCH /api/admin/products/:id/stock with { stock: 1, status: 'published' } to set stock=1.
        3. Create order with { items:[{sku, qty:1}], customer:{...all required fields...},
           couponCode: null }. Note the client sends NO price/subtotal — server must compute.
           → expect ok:true, order.subtotal == P (from DB), order.status='PAYMENT_PENDING',
             order.stockReserved=true, order.stockCommitted=false, payment.mocked=true.
           Verify stock is now 0 in DB.
        4. Immediately create SECOND order with the same SKU (stock is now 0):
           → expect 409 with error containing "Insufficient stock".
        5. Restore stock to a higher number for later tests: PATCH stock to 5.

      B) Server-side pricing tamper-proof:
        Attempt to send items:[{sku, qty:1, price:1}] with tampered price=1.
        → order.subtotal must equal real DB price P, NOT 1.

      C) Customer field validation:
        Send order missing customer.mobile → expect 400 "Customer field required: mobile".

      D) Coupon flow:
        Create coupon ARKTEST10 (percentage 10, minPurchase 5000). Place order with couponCode.
        → expect discount≈10% of subtotal, coupons.used incremented by 1, order.couponApplied.code='ARKTEST10'.

      E) Razorpay verify — mocked mode:
        Call POST /api/payments/razorpay/verify with { orderId } only (no signature).
        → expect { ok:true, mocked:true }. The order's paymentStatus MUST remain 'pending'
        (verify via GET /api/orders/:id).

      F) Razorpay verify — idempotent:
        Manually mark an order as paid in Mongo (via admin PUT /api/admin/orders/:id
        with paymentStatus='paid'). Then call verify with same orderId.
        Wait — you cannot easily manipulate Mongo. Instead skip this manual test; only assert
        the mocked-mode behaviour in (E).

      G) Razorpay webhook without secret:
        POST /api/webhooks/razorpay with any body and header. → expect 503 "Webhook not configured".

      H) Order tracking:
        Take an order from (A). Call POST /api/orders/track { orderId, identifier: <email used> }.
        → expect 200 with redacted order (no customer.email or customer.address in response).
        Call with wrong identifier → expect 404.

      I) Admin order state transitions:
        Take an order in PAYMENT_PENDING. PUT /api/admin/orders/:id { status: 'SHIPPED' }.
        → expect 400 "Invalid status transition" (can't jump PAYMENT_PENDING -> SHIPPED).
        Then PUT { paymentStatus: 'paid' } — that's a manual override, should succeed.
        Then PUT { status: 'PAID' } — should succeed (PAYMENT_PENDING -> PAID allowed).
        Then PUT { status: 'PROCESSING' } → success. Then { status: 'PACKED' } → success.
        Then { status: 'SHIPPED', courier: 'Delhivery', awb: '12345', trackingUrl: 'https://x' }
        → success; shipping fields must persist (verify via GET).

      J) Rate limiting sanity:
        Single-shot POST /api/newsletter and POST /api/contact still work with valid input.
        Do NOT hammer the endpoints — only verify single-request success.

      K) Dashboard revenue:
        Mark an order as paymentStatus='paid' (via admin PUT). Call GET /api/admin/dashboard.
        → expect revenue includes that order's total. Orders with pending payment must NOT be counted.

      L) Newsletter/Contact/Coupon validate/GET orders/:id — smoke test single request success.

      CLEANUP after tests:
        - Delete ARKTEST10 coupon.
        - Restore any product stock you changed to something sane (e.g. 5).

      Report PASS/FAIL for each labeled scenario (A–L) with brief evidence.
      Do NOT test frontend UI.
