// Transactional mailer wrapper. Uses nodemailer with generic SMTP env vars.
// Works with SendGrid, Amazon SES, Postmark, Gmail (with app password), Zoho, etc.
// If SMTP_HOST is not configured, all send() calls are safe no-ops that log and return {ok:false, skipped:true}.

let _transporter = null

async function getTransporter() {
  if (_transporter) return _transporter
  if (!process.env.SMTP_HOST) return null
  const nodemailer = (await import('nodemailer')).default
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined
  })
  return _transporter
}

export async function sendMail({ to, subject, html, text }) {
  try {
    const t = await getTransporter()
    if (!t) {
      console.log('[mailer] SMTP not configured, skipping mail to', to, '— subject:', subject)
      return { ok: false, skipped: true }
    }
    const from = process.env.SMTP_FROM || 'ARKADHATRI Atelier <atelier@arkadhatri.com>'
    await t.sendMail({ from, to, subject, html, text })
    return { ok: true }
  } catch (err) {
    console.error('[mailer] send failed:', err?.message || err)
    return { ok: false, error: err?.message }
  }
}

// ---- Email templates ----

const brand = {
  burgundy: '#4A0F1C', gold: '#C8A45A', ivory: '#F7F3EB', ink: '#111111'
}

function inr(n) { return new Intl.NumberFormat('en-IN').format(Number(n) || 0) }

function shell({ title, preheader, body }) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${brand.ivory};font-family:Georgia,serif;color:${brand.burgundy}">
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">${preheader || ''}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.ivory}">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid rgba(74,15,28,0.08);border-radius:2px">
        <tr><td align="center" style="padding:32px 32px 8px">
          <div style="font-family:'Cinzel',Georgia,serif;letter-spacing:0.35em;font-size:22px;color:${brand.burgundy};font-weight:600">ARKADHATRI</div>
          <div style="height:1px;width:56px;background:${brand.gold};margin:12px auto"></div>
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;color:${brand.burgundy};opacity:0.7;font-size:14px">Timeless South Indian Elegance</div>
        </td></tr>
        <tr><td style="padding:16px 32px 32px">${body}</td></tr>
        <tr><td align="center" style="padding:16px 32px 28px;border-top:1px solid rgba(74,15,28,0.08);color:${brand.burgundy};opacity:0.65;font-size:12px;font-family:Arial,sans-serif">
          ARKADHATRI — South Indian Sarees, Woven With Heritage.<br/>
          Questions? Message us on WhatsApp <a href="https://wa.me/918217204324" style="color:${brand.gold}">+91 82172 04324</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function orderTableHtml(order) {
  const rows = (order.items || []).map(it => `
    <tr>
      <td style="padding:8px 0;font-family:Georgia,serif;color:${brand.burgundy}">${it.name}<div style="font-size:12px;opacity:0.6">${it.sku || ''} · Qty ${it.qty || 1}</div></td>
      <td style="padding:8px 0;text-align:right;font-family:Georgia,serif;color:${brand.burgundy}">₹ ${inr((it.price||0)*(it.qty||1))}</td>
    </tr>`).join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    ${rows}
    <tr><td colspan="2" style="padding:6px 0;border-top:1px solid rgba(74,15,28,0.1)"></td></tr>
    <tr><td style="padding:4px 0;color:${brand.burgundy};opacity:0.8">Subtotal</td><td style="padding:4px 0;text-align:right;color:${brand.burgundy}">₹ ${inr(order.subtotal)}</td></tr>
    <tr><td style="padding:4px 0;color:${brand.burgundy};opacity:0.8">Shipping</td><td style="padding:4px 0;text-align:right;color:${brand.burgundy}">${(order.shipping||0)===0 ? 'Complimentary' : `₹ ${inr(order.shipping)}`}</td></tr>
    ${(order.discount||0) > 0 ? `<tr><td style="padding:4px 0;color:${brand.gold}">Discount ${order.couponApplied?.code ? `(${order.couponApplied.code})` : ''}</td><td style="padding:4px 0;text-align:right;color:${brand.gold}">− ₹ ${inr(order.discount)}</td></tr>` : ''}
    <tr><td style="padding:8px 0;border-top:1px solid rgba(74,15,28,0.1);font-family:'Cinzel',Georgia,serif;letter-spacing:0.15em;color:${brand.burgundy};font-weight:600">TOTAL</td><td style="padding:8px 0;text-align:right;border-top:1px solid rgba(74,15,28,0.1);font-family:Georgia,serif;color:${brand.burgundy};font-weight:600">₹ ${inr(order.total)}</td></tr>
  </table>`
}

export async function sendOrderConfirmation(order) {
  const to = order?.customer?.email
  if (!to) return { ok: false, error: 'no email' }
  const body = `
    <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-style:italic;color:${brand.burgundy};margin:0 0 8px">Thank you, ${order.customer?.fullName || 'namaste'}.</p>
    <p style="font-family:Georgia,serif;color:${brand.burgundy};opacity:0.85;line-height:1.65;margin:0 0 20px">Your ARKADHATRI order has been received. Our atelier is preparing your saree for dispatch.</p>
    <div style="font-family:'Cinzel',Georgia,serif;letter-spacing:0.3em;font-size:11px;color:${brand.gold};margin-bottom:6px">— ORDER ${order.id}</div>
    ${orderTableHtml(order)}
    <div style="margin:24px 0;padding:16px;background:${brand.ivory};border-left:2px solid ${brand.gold}">
      <div style="font-family:'Cinzel',Georgia,serif;letter-spacing:0.3em;font-size:10px;color:${brand.burgundy};opacity:0.7">DELIVERING TO</div>
      <div style="font-family:Georgia,serif;color:${brand.burgundy};margin-top:4px">${order.customer?.fullName}<br/>${order.customer?.address1 || ''}${order.customer?.address2 ? ', '+order.customer.address2 : ''}<br/>${order.customer?.city}, ${order.customer?.state} ${order.customer?.pincode}<br/>${order.customer?.mobile}</div>
    </div>
    <p style="font-family:Georgia,serif;color:${brand.burgundy};opacity:0.75;font-size:14px">You will receive another note once your saree is dispatched.</p>`
  return sendMail({ to, subject: `Your ARKADHATRI Order — ${order.id}`, html: shell({ title:'Order Confirmed', preheader:`Order ${order.id} confirmed`, body }) })
}

export async function sendPaymentFailed(order) {
  const to = order?.customer?.email
  if (!to) return { ok: false, error: 'no email' }
  const body = `
    <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-style:italic;color:${brand.burgundy}">Your payment did not go through.</p>
    <p style="font-family:Georgia,serif;color:${brand.burgundy};opacity:0.85;line-height:1.65">Your order <b>${order.id}</b> could not be completed because payment was not confirmed. No charge has been made. You may retry at any time.</p>
    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/order-success/${order.id}" style="display:inline-block;background:${brand.burgundy};color:${brand.ivory};padding:12px 24px;text-decoration:none;font-family:'Cinzel',Georgia,serif;letter-spacing:0.28em;font-size:11px;border-radius:2px">RETRY PAYMENT</a></p>`
  return sendMail({ to, subject:`Payment Not Completed — Order ${order.id}`, html: shell({ title:'Payment Failed', body }) })
}

export async function sendOrderShipped(order) {
  const to = order?.customer?.email
  if (!to) return { ok: false, error: 'no email' }
  const track = order.trackingUrl ? `<p><a href="${order.trackingUrl}" style="display:inline-block;background:${brand.gold};color:${brand.burgundy};padding:12px 24px;text-decoration:none;font-family:'Cinzel',Georgia,serif;letter-spacing:0.28em;font-size:11px;border-radius:2px">TRACK SHIPMENT</a></p>` : ''
  const body = `
    <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-style:italic;color:${brand.burgundy}">Your saree is on its way.</p>
    <p style="font-family:Georgia,serif;color:${brand.burgundy};opacity:0.85;line-height:1.65">Order <b>${order.id}</b> has been dispatched.</p>
    ${order.courier ? `<p style="font-family:Georgia,serif;color:${brand.burgundy}"><b>Courier:</b> ${order.courier}<br/><b>AWB:</b> ${order.awb || '—'}</p>` : ''}
    ${track}`
  return sendMail({ to, subject:`Your ARKADHATRI Order Has Shipped — ${order.id}`, html: shell({ title:'Shipped', body }) })
}

export async function sendOrderDelivered(order) {
  const to = order?.customer?.email
  if (!to) return { ok: false, error: 'no email' }
  const body = `
    <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-style:italic;color:${brand.burgundy}">Your saree has arrived.</p>
    <p style="font-family:Georgia,serif;color:${brand.burgundy};opacity:0.85;line-height:1.65">Order <b>${order.id}</b> was delivered. May the drape find its meaning in your hands.</p>`
  return sendMail({ to, subject:`Delivered — ARKADHATRI Order ${order.id}`, html: shell({ title:'Delivered', body }) })
}
