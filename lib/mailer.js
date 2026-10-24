// Transactional mailer (nodemailer + generic SMTP env vars).
// Works with Zoho Mail, Google Workspace, Microsoft 365, Amazon SES, Brevo, SendGrid, Postmark, Hostinger, etc.
// If SMTP_HOST is not configured, sends are safe no-ops that log and return { ok:false, skipped:true }.

import { LOGO_URL } from '@/lib/brand'

let _transporter = null

export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD)

async function getTransporter() {
  if (_transporter) return _transporter
  if (!process.env.SMTP_HOST) return null
  const nodemailer = (await import('nodemailer')).default
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined
  })
  return _transporter
}

const toText = (html) => String(html || '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|tr|h\d)>/gi, '\n')
  .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
  .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

export async function sendMail({ to, subject, html, text, replyTo }) {
  try {
    const t = await getTransporter()
    if (!t) {
      console.log('[mailer] SMTP not configured, skipping mail to', to, '— subject:', subject)
      return { ok: false, skipped: true }
    }
    const from = process.env.SMTP_FROM || 'ARKADHATRI <orders@arkadhatri.com>'
    await t.sendMail({ from, to, subject, html, text: text || toText(html), replyTo: replyTo || process.env.SMTP_REPLY_TO || undefined })
    return { ok: true }
  } catch (err) {
    console.error('[mailer] send failed:', err?.message || err)
    return { ok: false, error: err?.message }
  }
}

// ---------------------------------------------------------------- templates

const C = { burgundy: '#4A0F1C', ink: '#2A0810', gold: '#B08A3E', goldSoft: '#C8A45A', ivory: '#F7F3EB', line: '#E8DFD0', muted: '#5C4044' }
const SERIF = "Georgia,'Times New Roman',serif"
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif"

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const inr = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(n) || 0)
const base = () => (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')
const shortId = (id) => String(id || '').slice(0, 8).toUpperCase()
const fmtDate = (d) => { try { return new Date(d || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) } catch { return '' } }
const whatsapp = () => {
  const n = String(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918217204324').replace(/\D/g, '')
  const disp = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || '+91 82172 04324'
  return { url: `https://wa.me/${n}`, disp }
}

const button = (href, label, filled = true) =>
  `<a href="${esc(href)}" style="display:inline-block;background:${filled ? C.burgundy : '#ffffff'};color:${filled ? '#ffffff' : C.burgundy};border:1px solid ${C.burgundy};padding:14px 28px;text-decoration:none;font-family:${SANS};font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;border-radius:2px">${esc(label)}</a>`

const kicker = (t) => `<div style="font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.gold};margin:0 0 8px">${esc(t)}</div>`
const h1 = (t) => `<h1 style="font-family:${SERIF};font-weight:400;font-size:28px;line-height:1.25;color:${C.ink};margin:0 0 12px">${t}</h1>`
const para = (t) => `<p style="font-family:${SANS};font-size:16px;line-height:1.6;color:${C.muted};margin:0 0 16px">${t}</p>`

function shell({ title, preheader, body }) {
  const wa = whatsapp()
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.ivory};-webkit-text-size-adjust:100%">
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">${esc(preheader || '')}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ivory}">
    <tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${C.line}">
        <tr><td align="center" style="background:${C.burgundy};padding:26px 24px 22px">
          <img src="${esc(LOGO_URL)}" width="56" height="56" alt="ARKADHATRI" style="display:block;border:0;width:56px;height:56px;object-fit:contain;margin:0 auto 10px">
          <div style="font-family:${SERIF};font-size:22px;letter-spacing:8px;color:${C.goldSoft}">ARKADHATRI</div>
          <div style="font-family:${SANS};font-size:12px;letter-spacing:2px;color:#EADBC0;margin-top:6px;text-transform:uppercase">Timeless South Indian Elegance</div>
        </td></tr>
        <tr><td style="padding:32px 32px 8px">${body}</td></tr>
        <tr><td style="padding:24px 32px 28px;border-top:1px solid ${C.line}">
          <p style="font-family:${SANS};font-size:14px;line-height:1.6;color:${C.muted};margin:0 0 6px">Questions about your order? We're happy to help.</p>
          <p style="font-family:${SANS};font-size:14px;line-height:1.6;color:${C.muted};margin:0">WhatsApp <a href="${wa.url}" style="color:${C.burgundy};font-weight:600">${esc(wa.disp)}</a> &nbsp;·&nbsp; <a href="${base()}/track-order" style="color:${C.burgundy};font-weight:600">Track your order</a></p>
          <p style="font-family:${SANS};font-size:12px;line-height:1.6;color:#8A7478;margin:14px 0 0">ARKADHATRI · Handcrafted South Indian Sarees · arkadhatri.com<br>You are receiving this email because you placed an order with us.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function itemsTable(order) {
  const rows = (order.items || []).map((it) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:15px;color:${C.ink}">
        <div style="font-family:${SERIF};font-size:17px">${esc(it.name)}</div>
        <div style="font-size:13px;color:${C.muted};margin-top:2px">${esc(it.sku || '')}${it.sku ? ' · ' : ''}Qty ${esc(it.qty || 1)}</div>
      </td>
      <td align="right" style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:15px;color:${C.ink};white-space:nowrap">₹ ${inr((it.price || 0) * (it.qty || 1))}</td>
    </tr>`).join('')
  const line = (l, v, color = C.muted, bold = false) =>
    `<tr><td style="padding:6px 0;font-family:${SANS};font-size:15px;color:${color};${bold ? 'font-weight:700' : ''}">${l}</td><td align="right" style="padding:6px 0;font-family:${SANS};font-size:15px;color:${color};${bold ? 'font-weight:700' : ''};white-space:nowrap">${v}</td></tr>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 20px">
    ${rows}
    ${line('Subtotal', `₹ ${inr(order.subtotal)}`)}
    ${line('Shipping', (order.shipping || 0) === 0 ? 'Complimentary' : `₹ ${inr(order.shipping)}`)}
    ${(order.discount || 0) > 0 ? line(`Discount${order.couponApplied?.code ? ` (${esc(order.couponApplied.code)})` : ''}`, `− ₹ ${inr(order.discount)}`, '#2F6B3A') : ''}
    <tr><td colspan="2" style="border-top:2px solid ${C.ink};padding:0"></td></tr>
    ${line('Total', `₹ ${inr(order.total)}`, C.ink, true)}
  </table>`
}

function addressBlock(order) {
  const c = order.customer || {}
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ivory};border-left:3px solid ${C.goldSoft};margin:0 0 20px"><tr><td style="padding:16px 18px">
    <div style="font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.gold};margin-bottom:6px">Delivering to</div>
    <div style="font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink}">${esc(c.fullName)}<br>${esc(c.address1 || '')}${c.address2 ? ', ' + esc(c.address2) : ''}<br>${esc(c.city || '')}${c.state ? ', ' + esc(c.state) : ''} ${esc(c.pincode || '')}<br>${esc(c.mobile || '')}</div>
  </td></tr></table>`
}

const metaRow = (pairs) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid ${C.line}">${pairs.map(([k, v]) =>
  `<tr><td style="padding:10px 14px;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.muted};width:44%">${k}</td><td style="padding:10px 14px;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.ink};font-weight:600">${v}</td></tr>`).join('')}</table>`

// ---- builders (return { subject, html }) ----
const T = {
  'order-confirmation': (o) => ({
    subject: `Order confirmed — ARKADHATRI #${shortId(o.id)}`,
    html: shell({ title: 'Order confirmed', preheader: `Thank you. Your order #${shortId(o.id)} is confirmed.`, body: `
      ${kicker(`Order #${shortId(o.id)}`)}
      ${h1(`Thank you, ${esc(o.customer?.fullName?.split(' ')[0] || 'dear patron')}.`)}
      ${para('Your order is confirmed. Our atelier is now preparing your saree with care. We will email you again as soon as it is dispatched.')}
      ${itemsTable(o)}
      ${addressBlock(o)}
      <p style="margin:8px 0 24px">${button(`${base()}/track-order`, 'Track your order')}</p>` })
  }),
  'payment-receipt': (o) => ({
    subject: `Payment received — ₹ ${inr(o.total)} for order #${shortId(o.id)}`,
    html: shell({ title: 'Payment received', preheader: `We have received your payment of ₹ ${inr(o.total)}.`, body: `
      ${kicker('Payment receipt')}
      ${h1('Payment received')}
      ${para(`We have received your payment of <b style="color:${C.ink}">₹ ${inr(o.total)}</b>. Please keep this email for your records.`)}
      ${metaRow([
        ['Order', `#${shortId(o.id)}`],
        ['Amount paid', `₹ ${inr(o.total)}`],
        ['Payment ID', esc(o.razorpayPaymentId || '—')],
        ['Paid on', esc(fmtDate(o.paidAt))],
        ['Paid via', 'Razorpay (secure payment)']
      ])}
      ${para('Payments are processed securely by Razorpay. ARKADHATRI never sees or stores your card or UPI details.')}` })
  }),
  'payment-failed': (o) => ({
    subject: `Payment not completed — order #${shortId(o.id)}`,
    html: shell({ title: 'Payment not completed', preheader: 'Your payment did not go through. No money has been taken.', body: `
      ${kicker(`Order #${shortId(o.id)}`)}
      ${h1('Your payment did not go through')}
      ${para('No money has been taken. If any amount was debited by your bank, it is automatically reversed by Razorpay, usually within 5–7 working days.')}
      ${para('Your saree is held for a short while. You can try again whenever you are ready.')}
      <p style="margin:8px 0 24px">${button(`${base()}/order-success/${encodeURIComponent(o.id)}`, 'Try payment again')}</p>` })
  }),
  'order-shipped': (o) => ({
    subject: `Your saree is on its way — order #${shortId(o.id)}`,
    html: shell({ title: 'Shipped', preheader: 'Your ARKADHATRI order has been dispatched.', body: `
      ${kicker(`Order #${shortId(o.id)}`)}
      ${h1('Your saree is on its way')}
      ${para('Your order has been carefully packed and handed to our courier partner.')}
      ${metaRow([
        ['Courier', esc(o.courier || '—')],
        ['Tracking number (AWB)', esc(o.awb || '—')],
        ['Dispatched on', esc(fmtDate(o.shippedAt || o.updatedAt))]
      ])}
      ${addressBlock(o)}
      <p style="margin:8px 0 24px">${o.trackingUrl ? button(o.trackingUrl, 'Track shipment') + '&nbsp;&nbsp;' : ''}${button(`${base()}/track-order`, 'Order status', !o.trackingUrl)}</p>` })
  }),
  'order-delivered': (o) => ({
    subject: `Delivered — ARKADHATRI order #${shortId(o.id)}`,
    html: shell({ title: 'Delivered', preheader: 'Your saree has arrived.', body: `
      ${kicker(`Order #${shortId(o.id)}`)}
      ${h1('Your saree has arrived')}
      ${para('We hope it brings you joy for many occasions to come. For long life, store it folded in a soft cotton cloth and refold it every few months.')}
      ${para('If anything is not as expected, simply reply to this email or message us on WhatsApp.')}` })
  }),
  'refund-initiated': (o) => ({
    subject: `Refund initiated — ₹ ${inr(o.refundAmount || o.total)} for order #${shortId(o.id)}`,
    html: shell({ title: 'Refund initiated', preheader: 'Your refund has been initiated.', body: `
      ${kicker(`Order #${shortId(o.id)}`)}
      ${h1('Your refund has been initiated')}
      ${para(`We have initiated a refund of <b style="color:${C.ink}">₹ ${inr(o.refundAmount || o.total)}</b> to your original payment method.`)}
      ${metaRow([['Refund reference', esc(o.refundId || '—')], ['Expected time', '5–7 working days (bank dependent)']])}` })
  }),
  'refund-processed': (o) => ({
    subject: `Refund completed — order #${shortId(o.id)}`,
    html: shell({ title: 'Refund completed', preheader: 'Your refund has been processed.', body: `
      ${kicker(`Order #${shortId(o.id)}`)}
      ${h1('Your refund is complete')}
      ${para(`₹ ${inr(o.refundAmount || o.total)} has been refunded to your original payment method. Depending on your bank, it may take a few days to appear in your statement.`)}
      ${metaRow([['Refund reference', esc(o.refundId || '—')]])}` })
  }),
  'admin-password-reset': (_o, link) => ({
    subject: 'Reset your ARKADHATRI admin password',
    html: shell({ title: 'Password reset', preheader: 'Use this link within 30 minutes.', body: `
      ${kicker('Admin security')}
      ${h1('Reset your admin password')}
      ${para('Someone (hopefully you) asked to reset the ARKADHATRI admin password. This link works once and expires in 30 minutes.')}
      <p style="margin:8px 0 24px">${button(link || '#', 'Choose a new password')}</p>
      ${para('If you did not request this, you can ignore this email. Your password will not change.')}` })
  })
}

export const EMAIL_TEMPLATES = Object.keys(T).filter((k) => k !== 'admin-password-reset').concat('admin-password-reset')

const send = async (key, order, extra) => {
  const to = order?.customer?.email
  if (!to) return { ok: false, error: 'no email' }
  const { subject, html } = T[key](order, extra)
  return sendMail({ to, subject, html })
}

export const sendOrderConfirmation = async (order) => {
  const a = await send('order-confirmation', order)
  if (order?.razorpayPaymentId) await send('payment-receipt', order)
  return a
}
export const sendPaymentReceipt = (order) => send('payment-receipt', order)
export const sendPaymentFailed = (order) => send('payment-failed', order)
export const sendOrderShipped = (order) => send('order-shipped', order)
export const sendOrderDelivered = (order) => send('order-delivered', order)
export const sendRefundInitiated = (order) => send('refund-initiated', order)
export const sendRefundProcessed = (order) => send('refund-processed', order)
export const sendAdminPasswordReset = (to, link) => {
  const { subject, html } = T['admin-password-reset'](null, link)
  return sendMail({ to, subject, html })
}

// ---- sample data for admin previews (no real customer data) ----
const SAMPLE = {
  id: 'a1b2c3d4-sample', items: [{ name: 'Kavya', sku: 'ARK-KV-001', qty: 1, price: 24500 }],
  subtotal: 24500, shipping: 0, discount: 2450, couponApplied: { code: 'WELCOME10' }, total: 22050,
  customer: { fullName: 'Ananya Rao', email: 'customer@example.com', mobile: '+91 98765 43210', address1: '12, Temple Street', address2: 'Malleshwaram', city: 'Bengaluru', state: 'Karnataka', pincode: '560003' },
  razorpayPaymentId: 'pay_SAMPLE123456', paidAt: new Date(), courier: 'Blue Dart', awb: '12345678901', trackingUrl: 'https://www.bluedart.com/', shippedAt: new Date(),
  refundId: 'rfnd_SAMPLE7890', refundAmount: 22050
}
export const emailPreview = (key) => (T[key] ? T[key](SAMPLE, `${base()}/admin/reset-password?token=sample`).html : null)
