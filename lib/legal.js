// Legal & informational pages content (single source of truth)

export const LEGAL_PAGES = {
  'privacy-policy': {
    title: 'Privacy Policy',
    eyebrow: '\u2014 THE FINE PRINT',
    updated: 'Effective from January 2025',
    sections: [
      { h: 'Who we are', p: 'ARKADHATRI is a premium South Indian saree boutique registered in Karnataka, India. This policy explains what we collect and how we use it.' },
      { h: 'What we collect', p: 'When you shop, subscribe or write in, we collect your name, contact details, delivery address, payment reference and order history. We use secure cookies to remember your bag and improve the boutique experience.' },
      { h: 'How we use your details', p: 'To dispatch your orders, respond to enquiries, keep you informed of new arrivals (only if you opt in), and comply with tax and shipping regulations. We never sell your details to third parties.' },
      { h: 'Payments', p: 'Payments are processed by trusted providers (such as Razorpay). We do not store your full card, UPI or netbanking credentials on our servers.' },
      { h: 'Your rights', p: 'You may request access, correction or deletion of your personal details at any time by writing to us at hello@arkadhatri.com.' },
      { h: 'Contact', p: 'For any privacy question, write to hello@arkadhatri.com or use the WhatsApp support link in the footer.' }
    ]
  },
  terms: {
    title: 'Terms & Conditions',
    eyebrow: '\u2014 THE AGREEMENT',
    updated: 'Effective from January 2025',
    sections: [
      { h: 'The boutique', p: 'By purchasing from ARKADHATRI you agree to these terms. We reserve the right to update them; the version live at the time of your purchase applies to your order.' },
      { h: 'Product listings', p: 'Each saree is handpicked and photographed in natural light. Minor variation in tone is a signature of handwoven silk, not a defect.' },
      { h: 'Pricing', p: 'All prices are in Indian Rupees, inclusive of GST. Shipping charges (if any) are calculated at checkout.' },
      { h: 'Orders', p: 'An order is confirmed only after successful payment. We reserve the right to cancel an order if a piece is discovered to be damaged or unavailable before dispatch; a full refund is issued in such cases.' },
      { h: 'Intellectual property', p: 'All photography, copy and design on this website are the property of ARKADHATRI and may not be reproduced without written permission.' },
      { h: 'Governing law', p: 'These terms are governed by the laws of India. Disputes fall under the jurisdiction of courts in Bengaluru, Karnataka.' }
    ]
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    eyebrow: '\u2014 DELIVERY',
    updated: 'Effective from January 2025',
    sections: [
      { h: 'Karnataka', p: 'Complimentary delivery across Karnataka within 3\u20135 working days.' },
      { h: 'Rest of India', p: 'Insured, tracked shipping within 5\u20138 working days. Complimentary above \u20b9 15,000; a flat fee applies below.' },
      { h: 'Bridal pieces', p: 'Wedding sarees are dispatched with white-glove insured delivery. A representative may call to arrange a convenient delivery slot.' },
      { h: 'Packaging', p: 'Every piece is presented in ARKADHATRI\u2019s signature packaging, sealed and quality-checked at the atelier.' },
      { h: 'Tracking', p: 'A tracking link is shared over email and WhatsApp within 24 hours of dispatch.' },
      { h: 'International', p: 'International shipping is currently by request. Please write to hello@arkadhatri.com for a quote.' }
    ]
  },
  returns: {
    title: 'Return & Refund Policy',
    eyebrow: '\u2014 RETURNS',
    updated: 'Effective from January 2025',
    sections: [
      { h: '7-day return window', p: 'You may initiate a return within 7 days of delivery. The saree must be unworn, unwashed, with original tags and packaging intact.' },
      { h: 'How to return', p: 'Write to hello@arkadhatri.com or WhatsApp us with your order number and reason. We will arrange a reverse pickup at no cost within Karnataka; a nominal fee applies elsewhere.' },
      { h: 'Refund timeline', p: 'Once we receive and inspect the return, refunds are issued to the original payment method within 5\u20137 working days.' },
      { h: 'Non-returnable', p: 'Custom-tailored blouses, blouse-piece cuts, and any piece marked \u201cfinal sale\u201d are not eligible for return.' },
      { h: 'Exchanges', p: 'We are happy to exchange a piece for another of equal or higher value (with the price difference paid). Please write to us to arrange this.' }
    ]
  },
  contact: {
    title: 'Contact Us',
    eyebrow: '\u2014 WRITE TO THE ATELIER',
    updated: 'We reply within one working day.',
    sections: [
      { h: 'Email', p: 'hello@arkadhatri.com' },
      { h: 'WhatsApp', p: '+91 \u2014 (add your number here)' },
      { h: 'Atelier hours', p: 'Monday \u2014 Saturday \u00b7 10:00 to 19:00 IST' },
      { h: 'Address', p: 'ARKADHATRI Atelier \u00b7 Karnataka \u00b7 India' },
      { h: 'Press & partnerships', p: 'For press or partnership enquiries, please write to hello@arkadhatri.com with \u201cPress\u201d or \u201cPartnership\u201d in the subject line.' }
    ]
  },
  faq: {
    title: 'Frequently Asked Questions',
    eyebrow: '\u2014 GOOD TO KNOW',
    updated: '',
    sections: [
      { h: 'Are your sarees authentic?', p: 'Every ARKADHATRI saree is handpicked by our founders and quality-checked before dispatch. Kanjivaram and Mysore silks carry authentic zari and traditional weaves.' },
      { h: 'Do you tailor blouses?', p: 'At launch we ship the blouse piece unstitched with each saree. Custom tailoring will be introduced shortly.' },
      { h: 'How do I care for my saree?', p: 'Dry-clean only. Store folded in muslin cloth, away from direct sunlight, and refold every three months to avoid crease lines.' },
      { h: 'What are the payment options?', p: 'We accept UPI, credit / debit cards, netbanking and popular wallets through Razorpay. Cash on Delivery is not currently supported.' },
      { h: 'Do you ship internationally?', p: 'International shipping is by request. Please write to us with your address and we\u2019ll share a quote.' },
      { h: 'Can I return a saree?', p: 'Yes \u2014 within 7 days of delivery, unworn and unwashed with tags and packaging intact.' }
    ]
  }
}

export const getLegalPage = (slug) => LEGAL_PAGES[slug]
export const legalSlugs = () => Object.keys(LEGAL_PAGES)
