// Order state machine + safe transitions.
// The BACKEND is the source of truth for order/payment status.

export const ORDER_STATES = {
  PAYMENT_PENDING:  'PAYMENT_PENDING',
  PAID:             'PAID',
  PAYMENT_FAILED:   'PAYMENT_FAILED',
  PROCESSING:       'PROCESSING',
  PACKED:           'PACKED',
  SHIPPED:          'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED:        'DELIVERED',
  CANCELLED:        'CANCELLED',
  REFUND_INITIATED: 'REFUND_INITIATED',
  REFUNDED:         'REFUNDED'
}

export const PAYMENT_STATES = {
  PENDING: 'pending',
  PAID:    'paid',
  FAILED:  'failed',
  REFUNDED:'refunded'
}

// Allowed transitions from -> to (any change not in this map is rejected server-side).
const NEXT = {
  PAYMENT_PENDING:  ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAID:             ['PROCESSING', 'CANCELLED', 'REFUND_INITIATED'],
  PROCESSING:       ['PACKED', 'CANCELLED', 'REFUND_INITIATED'],
  PACKED:           ['SHIPPED', 'CANCELLED', 'REFUND_INITIATED'],
  SHIPPED:          ['OUT_FOR_DELIVERY', 'DELIVERED', 'REFUND_INITIATED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'REFUND_INITIATED'],
  DELIVERED:        ['REFUND_INITIATED'],
  REFUND_INITIATED: ['REFUNDED'],
  REFUNDED:         [],
  CANCELLED:        [],
  PAYMENT_FAILED:   ['PAYMENT_PENDING', 'CANCELLED']
}

export function canTransition(from, to) {
  const cur = String(from || '').toUpperCase()
  const nxt = String(to || '').toUpperCase()
  if (!NEXT[cur]) return false
  return NEXT[cur].includes(nxt)
}

export function isTerminal(state) {
  const s = String(state || '').toUpperCase()
  return ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(s)
}
