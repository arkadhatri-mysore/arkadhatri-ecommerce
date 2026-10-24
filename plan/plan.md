# ARKADHATRI — Completion Plan: Live Razorpay Payments and a Bug-Free Launch

A premium online boutique for handcrafted South Indian silk sarees, with a full admin panel for products, photos, videos, stock, orders and coupons.
This plan finishes the site: it closes the remaining bugs, switches on real Razorpay payments and refunds, and checks every page end to end before launch.

## Who it's for
- **Customers** across India who buy premium silk sarees online and pay by card, UPI, net banking or wallet.
- **The ARKADHATRI owner and staff**, who run the shop from the admin panel, often on a phone.

## Where things stand today

### Shop (what customers see), built
- Home page with hero, collections, featured sarees, craft story, reviews and newsletter sign-up.
- Collection pages with filters (fabric, colour, occasion, availability, price) and sorting.
- Product pages with a photo gallery, short video, price, a "sold out" state, the craft details strip, and the Care & Draping guide (care tips by fabric plus 6 draping steps).
- A short preview video plays on product cards on hover (computer) or when on screen (phone).
- A homepage "In Motion" strip of short videos, shown once any saree has a video.
- Search, bag, checkout (with coupons), the order-success page, and a public order-tracking page.
- A readability pass: headlines keep the elegant serif; body text moved to a clearer font, with darker text and larger small labels.
- Branded "page not found" and error pages. If a page fails to load, the browser reloads it once by itself.

### Admin panel, built
- Login, and a dashboard showing sales, orders and stock alerts.
- Products: create and edit. Photos and short videos upload straight from a phone or computer; photos are resized automatically and a video cover frame is created. Pasting a link also works. Each saree can have its own care tips and a draping note.
- Edits show on the shop immediately. Earlier, the shop showed a fixed built-in list and ignored the admin panel.
- Inventory with low-stock and sold-out lists, and quick stock changes.
- Orders: status changes in a safe order, plus courier name, tracking number and tracking link.
- Customers, Coupons, Newsletter subscribers, Enquiries and Settings.

### Behind the scenes, built
- Prices are always recalculated on the server, so a customer cannot change what they pay.
- Stock is held when an order is placed and released if payment fails, so two people can't buy the last saree.
- Payment confirmation checks Razorpay's secure signature and ignores duplicate notifications.
- Request limits protect ordering, tracking and the contact forms.
- Order emails (confirmed, shipped, delivered, payment failed) are written but switched off until a mailbox is connected.

### Known open issues, fixed in Phase 1
- A test product made in the admin panel ("Test Upload Saree") did not open on the shop. The cause has not been confirmed yet (it may have saved as a draft, or the page address may not match). It will be found, fixed and the test product removed.
- The preview server restarted under memory pressure, which caused the "ChunkLoadError" seen on the Coupons page. The memory cap has been raised and an automatic reload added; this still needs to be confirmed across every admin page.
- The automatic video cover could not be confirmed in the test browser. It needs checking in real Chrome and Safari.

## Core features and experience (to complete)
1. **Live Razorpay payments.** Customers pay by card, UPI, net banking or wallet in the Razorpay window. An order is marked paid only after the payment is checked on the server and confirmed by Razorpay. Payments are captured automatically, so none are left half-done.
2. **Refunds, two ways.**
   - A **Refund** button on each paid order in the admin panel: full or partial amount, with a reason.
   - Refunds made directly in the Razorpay dashboard also update the order automatically.
   - Either way, the order shows *Refund initiated → Refunded* (or *Refund failed*), the customer is emailed, and returned stock can be added back.
3. **Payment status everywhere.** Paid, failed and refunded states show clearly on the order-success page, on order tracking and in the admin orders list.
4. **Policy pages Razorpay requires.** About, Contact (business email, phone, address), Terms, Privacy, Shipping, and Cancellation & Refund. Each page is reachable from the footer, filled with editable wording that matches how the shop actually works.
5. **Order emails switched on** from the ARKADHATRI (arkadhatri.com) mailbox: order confirmed, payment failed, shipped, delivered, and refund issued.
6. **Full bug sweep.** Every shop page, admin page, checkout, payment, refund, upload and tracking flow is checked on computer and phone screens, and every problem found is fixed.

## User flow
**Customer:** browse or search → open a saree (photos, video, care guide) → add to bag → checkout with delivery details and an optional coupon → pay in the Razorpay window → order-success page plus confirmation email → track the order with order number and email or phone → receive shipped and delivered emails.

**Owner:** sign in to admin → add or edit sarees, upload photos and videos, set price and stock → see new paid orders → mark packed and shipped, adding courier and tracking number → refund from the order page if needed → watch stock alerts and sales on the dashboard.

## UI/UX feel
- Unchanged luxury look: deep burgundy, antique gold and ivory, with the same elegant serif headlines.
- Easy-to-read body text throughout, at a comfortable size.
- Payment and refund screens are calm and reassuring: clear amounts, plain status words, and no technical error messages shown to customers.
- The admin panel stays simple enough to run from a phone.

## Implementation phases

### Phase 1 — Launch-ready (MVP, built now)
- Fix the three known open issues listed above, and remove the leftover test product.
- Connect live Razorpay keys and the live webhook. Confirm payments are captured automatically.
- Add the admin **Refund** button, automatic syncing of refunds made in the Razorpay dashboard, and refund emails.
- Add the required policy pages and footer links.
- Connect the arkadhatri.com mailbox for order emails.
- Full end-to-end bug sweep on computer and phone, fixing everything found.
- Go-live check: one small real payment is captured and shows as paid, then refunded and shows as refunded, with the emails received.

### Phase 2 — Growth (later)
- Courier integration (for example Shiprocket) for automatic shipping labels and live tracking.
- WhatsApp order alerts for the owner, and WhatsApp updates for customers.
- Wishlist that is saved per customer, and back-in-stock alerts.
- Editing the homepage banner and collection images from the admin panel.

### Phase 3 — Scale (later)
- Customer accounts with order history.
- GST invoices sent automatically with each order.
- Sales reports and export to spreadsheets.
- Product reviews with photos from buyers.

## Assumptions
- **Live payments right away (your choice).** This needs your Razorpay account already approved (KYC done, website reviewed). You will supply three items, entered through a secure form, never pasted in chat: **Live Key ID**, **Live Key Secret** and **Webhook Secret**.
- **Webhook:** you, or the builder with you, create a webhook in Razorpay Live Mode pointing to the site's webhook address. It is subscribed to: payment captured, payment failed, order paid, refund created, refund processed and refund failed.
- **The real-money check** uses a small amount (for example ₹10 to ₹100) paid on your own card or UPI, then refunded.
- **Refunds both ways (your choice).** The admin button sends refunds through Razorpay. Refunds made in the Razorpay dashboard are picked up automatically. Partial refunds are allowed.
- **Online payment only (your choice).** No Cash on Delivery.
- **Email:** order emails are sent from an arkadhatri.com mailbox, for example orders@arkadhatri.com. You will supply that mailbox's sending details (mail server name, port, login, password) from your email provider (such as Google Workspace, Zoho or your web host), entered through the same secure form. Without them, everything else launches and emails stay off.
- **Policy wording** is a sensible starting draft (7-day returns on unworn sarees, delivery in 3 to 8 working days, as the site already states). You review and edit it before launch. It is not legal advice.
- **Business details** for the Contact page and invoices (registered name, address, phone, GST number if any) come from you. Clearly marked placeholders stay until then.
- **The admin password** (`ArkAdmin@2025`) is changed to one you choose before launch, together with the secret code that protects admin logins.
- **Uploaded photos and videos** are stored in the shop's own database, so they move with the site when you self-host. No extra account is needed.
- **Shipping charges** stay as now: a flat charge, free above a set order value, both editable in Settings.
- **Preview vs launch:** testing happens on the current preview address. Your own domain and hosting are set up after this plan, using the self-hosting guide already provided.
