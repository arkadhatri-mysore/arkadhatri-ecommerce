// Central product catalogue with SKU, badges, and structured filter metadata.
// Adding a new saree = adding one entry here. UI updates automatically.

export const PRODUCTS = [
  {
    slug: 'kavya', sku: 'ARK-KV-001', name: 'Kavya',
    tagline: 'Kanjivaram Silk • Deep Ruby',
    price: 24500, currency: '₹',
    collection: 'silk-sarees', collectionName: 'Silk Sarees',
    fabricType: 'Kanjivaram Silk',
    colourFamily: 'Red',
    colourName: 'Deep Ruby',
    occasion: ['Wedding', 'Reception', 'Festive'],
    inStock: true,
    isNew: false, isBestseller: true, isTrending: false, isLimited: false,
    images: [
      'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1623171404570-1d196759fe20?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1783864424950-ccca6d6d52aa?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A deep ruby Kanjivaram silk, woven with contrast temple borders and a heavy zari pallu. Composed at our atelier in Karnataka and suited to the most considered wedding wardrobes.',
    details: {
      Fabric: 'Pure Kanjivaram silk, mulberry-fibre.',
      Colour: 'Deep ruby with antique-gold zari.',
      Occasion: 'Wedding · Reception · Grand festive gatherings.',
      'Blouse Piece': '0.8 m unstitched contrast blouse in ruby with matching zari border.',
      'Wash Care': 'Dry-clean only. Store folded in a muslin cloth. Do not spray perfume directly on the fabric.',
      Delivery: 'Complimentary delivery across Karnataka within 3–5 working days. India: 5–8 working days.',
      Returns: 'Easy 7-day return on all pieces. The saree must be unworn, with original packaging.'
    },
    seoTitle: 'Kavya – Kanjivaram Silk Saree in Deep Ruby | ARKADHATRI',
    seoDescription: 'Kavya is a Kanjivaram silk saree in deep ruby with temple borders and gold zari. Handpicked in Karnataka by ARKADHATRI.'
  },
  {
    slug: 'bhavana', sku: 'ARK-BH-002', name: 'Bhavana',
    tagline: 'Mysore Silk • Royal Purple',
    price: 18900, currency: '₹',
    collection: 'silk-sarees', collectionName: 'Silk Sarees',
    fabricType: 'Mysore Silk',
    colourFamily: 'Purple',
    colourName: 'Royal Purple',
    occasion: ['Reception', 'Anniversary', 'Temple'],
    inStock: true,
    isNew: false, isBestseller: false, isTrending: true, isLimited: false,
    images: [
      'https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1630663124437-382b3831e7d8?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1783864424950-ccca6d6d52aa?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A regal Mysore silk in royal purple, edged with a slim zari border. Fluid drape, quiet weight — an heirloom for anniversaries, receptions and temple visits.',
    details: {
      Fabric: 'Pure Mysore crêpe silk with fine zari.',
      Colour: 'Royal purple with muted gold border.',
      Occasion: 'Reception · Sangeet · Anniversary · Temple visits.',
      'Blouse Piece': '0.8 m unstitched blouse in matching purple silk.',
      'Wash Care': 'Dry-clean only. Store folded, away from direct sunlight.',
      Delivery: 'Karnataka: 3–5 working days. India: 5–8 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Bhavana – Mysore Silk Saree in Royal Purple | ARKADHATRI',
    seoDescription: 'Bhavana is a Mysore silk saree in royal purple with fine zari border. A quietly regal piece from ARKADHATRI, Karnataka.'
  },
  {
    slug: 'meenakshi', sku: 'ARK-MK-003', name: 'Meenakshi',
    tagline: 'Temple Border • Bridal Red',
    price: 38500, currency: '₹',
    collection: 'wedding-sarees', collectionName: 'Wedding Sarees',
    fabricType: 'Kanjivaram Silk',
    colourFamily: 'Red',
    colourName: 'Bridal Red',
    occasion: ['Wedding', 'Muhurtham'],
    inStock: true,
    isNew: false, isBestseller: true, isTrending: false, isLimited: true,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1774437775332-eb986805d0e7?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A bridal saree composed with a heavy temple-motif border and an intricate zari pallu — designed to be a lasting keepsake for the bride.',
    details: {
      Fabric: 'Pure Kanjivaram silk with 24k gilded silver zari.',
      Colour: 'Bridal red with antique-gold temple border.',
      Occasion: 'Bridal · Muhurtham · Wedding day.',
      'Blouse Piece': '0.8 m unstitched contrast blouse in bridal red with zari border.',
      'Wash Care': 'Dry-clean only. Store folded in muslin. Refold every three months.',
      Delivery: 'Karnataka: 3–5 working days. India: 5–8 working days. Insured white-glove delivery.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Meenakshi – Bridal Kanjivaram Saree | Temple Border | ARKADHATRI',
    seoDescription: 'Meenakshi is a bridal Kanjivaram silk saree with a heavy temple motif border and intricate zari pallu. Handpicked by ARKADHATRI.'
  },
  {
    slug: 'anjali', sku: 'ARK-AJ-004', name: 'Anjali',
    tagline: 'Festival Silk • Emerald & Gold',
    price: 22900, currency: '₹',
    collection: 'festival-sarees', collectionName: 'Festival Sarees',
    fabricType: 'Pure Silk',
    colourFamily: 'Green',
    colourName: 'Emerald Green',
    occasion: ['Festive', 'Diwali', 'Temple'],
    inStock: true,
    isNew: false, isBestseller: false, isTrending: true, isLimited: false,
    images: [
      'https://images.unsplash.com/photo-1758120221788-d576fa58f520?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1774437775332-eb986805d0e7?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1742287724816-4a8a1cc7ad5c?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A festival silk in deep emerald with a broad antique-gold border. Elegant, understated, and suited to Diwali evenings, temple functions and family celebrations.',
    details: {
      Fabric: 'Pure silk with zari border.',
      Colour: 'Emerald green with antique-gold border.',
      Occasion: 'Diwali · Ugadi · Festive gatherings · Family functions.',
      'Blouse Piece': '0.8 m unstitched blouse in matching emerald.',
      'Wash Care': 'Dry-clean only. Store folded, refold every three months.',
      Delivery: 'Karnataka: 3–5 working days. India: 5–8 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Anjali – Emerald Festival Silk Saree | ARKADHATRI',
    seoDescription: 'Anjali is a festival silk saree in emerald green with antique-gold border. A refined piece for Diwali and temple gatherings.'
  },
  {
    slug: 'lakshmi', sku: 'ARK-LK-005', name: 'Lakshmi',
    tagline: 'Kanjivaram Silk • Bridal Gold',
    price: 26400, currency: '₹',
    collection: 'wedding-sarees', collectionName: 'Wedding Sarees',
    fabricType: 'Kanjivaram Silk',
    colourFamily: 'Gold',
    colourName: 'Bridal Gold',
    occasion: ['Wedding', 'Reception', 'Muhurtham'],
    inStock: true,
    isNew: true, isBestseller: false, isTrending: false, isLimited: false,
    images: [
      'https://images.unsplash.com/photo-1774437775332-eb986805d0e7?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A ceremonial Kanjivaram in warm bridal gold — the piece for the family bride who chooses grace over grandeur.',
    details: {
      Fabric: 'Pure Kanjivaram silk with 24k gilded zari.',
      Colour: 'Bridal gold with contrast red pallu.',
      Occasion: 'Bridal · Muhurtham · Reception.',
      'Blouse Piece': '0.8 m unstitched contrast red blouse with zari border.',
      'Wash Care': 'Dry-clean only. Store folded in muslin.',
      Delivery: 'Karnataka: 3–5 working days. India: 5–8 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Lakshmi – Bridal Gold Kanjivaram Saree | ARKADHATRI',
    seoDescription: 'Lakshmi is a ceremonial Kanjivaram in bridal gold with a contrast red pallu. Curated by ARKADHATRI, Karnataka.'
  },
  {
    slug: 'anagha', sku: 'ARK-AN-006', name: 'Anagha',
    tagline: 'Zari Border • Antique Gold',
    price: 19500, currency: '₹',
    collection: 'festival-sarees', collectionName: 'Festival Sarees',
    fabricType: 'Pure Silk',
    colourFamily: 'Gold',
    colourName: 'Antique Gold',
    occasion: ['Festive', 'Temple'],
    inStock: true,
    isNew: false, isBestseller: false, isTrending: false, isLimited: false,
    images: [
      'https://images.unsplash.com/photo-1742287721821-ddf522b3f37b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1630663124437-382b3831e7d8?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A pure silk with antique-gold zari border and an intricate hand-inlaid pallu — a piece for festive evenings and family celebrations.',
    details: {
      Fabric: 'Pure silk with hand-inlaid zari.',
      Colour: 'Rich mustard body with antique-gold border.',
      Occasion: 'Festive · Family functions · Temple visits.',
      'Blouse Piece': '0.8 m unstitched blouse in matching silk.',
      'Wash Care': 'Dry-clean only.',
      Delivery: 'Karnataka: 3–5 working days. India: 5–8 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Anagha – Antique Gold Zari Silk Saree | ARKADHATRI',
    seoDescription: 'Anagha is a pure silk saree with antique-gold zari border and hand-inlaid pallu. For festive evenings, from ARKADHATRI.'
  },
  {
    slug: 'radhika', sku: 'ARK-RD-007', name: 'Radhika',
    tagline: 'Handwoven Silk • Traditional Weave',
    price: 21900, currency: '₹',
    collection: 'everyday-elegance', collectionName: 'Everyday Elegance',
    fabricType: 'Handwoven Silk',
    colourFamily: 'Beige',
    colourName: 'Warm Ochre',
    occasion: ['Everyday', 'Office'],
    inStock: true,
    isNew: true, isBestseller: false, isTrending: false, isLimited: false,
    images: [
      'https://images.unsplash.com/photo-1742287724816-4a8a1cc7ad5c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1630663124437-382b3831e7d8?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A softly handwoven silk in a traditional weave — quiet enough for the workday, refined enough for a soirée.',
    details: {
      Fabric: 'Handwoven pure silk.',
      Colour: 'Warm ochre body with muted zari border.',
      Occasion: 'Everyday elegance · Office · Small gatherings.',
      'Blouse Piece': '0.8 m unstitched blouse in matching silk.',
      'Wash Care': 'Dry-clean only.',
      Delivery: 'Karnataka: 3–5 working days. India: 5–8 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Radhika – Handwoven Silk Saree | Everyday Elegance | ARKADHATRI',
    seoDescription: 'Radhika is a handwoven silk saree in ochre with muted zari border — refined everyday elegance from ARKADHATRI.'
  },
  {
    slug: 'rukmini', sku: 'ARK-RK-008', name: 'Rukmini',
    tagline: 'Heritage Silk • Zari Detail',
    price: 42000, currency: '₹',
    collection: 'wedding-sarees', collectionName: 'Wedding Sarees',
    fabricType: 'Heritage Silk',
    colourFamily: 'Red',
    colourName: 'Deep Crimson',
    occasion: ['Wedding', 'Muhurtham'],
    inStock: true,
    isNew: true, isBestseller: false, isTrending: false, isLimited: true,
    images: [
      'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1774437775332-eb986805d0e7?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A heritage silk composed with fine zari detailing across the pallu and border — an heirloom-in-the-making.',
    details: {
      Fabric: 'Pure heritage silk with hand-inlaid zari.',
      Colour: 'Deep crimson with 24k gilded zari.',
      Occasion: 'Bridal · Wedding · Muhurtham.',
      'Blouse Piece': '0.8 m unstitched contrast blouse with zari border.',
      'Wash Care': 'Dry-clean only. Store folded in muslin.',
      Delivery: 'Karnataka: 3–5 working days. India: 5–8 working days. Insured white-glove delivery.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Rukmini – Heritage Silk Saree with Zari Detail | ARKADHATRI',
    seoDescription: 'Rukmini is a heritage silk saree in deep crimson with fine zari detailing — an heirloom-in-the-making from ARKADHATRI.'
  }
]

export const COLLECTIONS = [
  { slug: 'silk-sarees',        name: 'Silk Sarees',        tag: 'The Signature Weave', desc: 'The signature ARKADHATRI weave — pure silk composed for the woman who values timeless elegance.', image: 'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=1600&q=85' },
  { slug: 'wedding-sarees',     name: 'Wedding Sarees',     tag: 'For The Bride',       desc: 'Kanjivaram silks and heritage pieces composed for muhurtham, reception and the days that stay in memory.',              image: 'https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1600&q=85' },
  { slug: 'festival-sarees',    name: 'Festival Sarees',    tag: 'Occasion Silks',      desc: 'Refined silks for Diwali, Ugadi, temple visits and gatherings that matter.',                                                image: 'https://images.unsplash.com/photo-1774437775332-eb986805d0e7?auto=format&fit=crop&w=1600&q=85' },
  { slug: 'everyday-elegance',  name: 'Everyday Elegance',  tag: 'Daily Wear Sarees',   desc: 'Softly handwoven pieces quiet enough for the workday and refined enough for a soirée.',                                image: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1600&q=85' },
  { slug: 'new-arrivals',       name: 'New Arrivals',       tag: 'Just In',             desc: 'The latest sarees to arrive at the atelier.',                                                                                     image: 'https://images.unsplash.com/photo-1758120221788-d576fa58f520?auto=format&fit=crop&w=1600&q=85' }
]

export const getProduct   = (slug) => PRODUCTS.find((p) => p.slug === slug)
export const getCollection = (slug) => COLLECTIONS.find((c) => c.slug === slug)
export const getProductsByCollection = (slug) =>
  slug === 'new-arrivals'
    ? PRODUCTS.filter((p) => p.isNew)
    : PRODUCTS.filter((p) => p.collection === slug)

// Smarter related-product logic: prefer same fabric/occasion first, then same collection, then price band.
export const getRelated = (slug, count = 4) => {
  const current = getProduct(slug)
  if (!current) return PRODUCTS.slice(0, count)
  const others = PRODUCTS.filter((p) => p.slug !== slug)
  const scored = others.map((p) => {
    let s = 0
    if (p.fabricType === current.fabricType) s += 4
    if (p.collection === current.collection) s += 3
    if (p.occasion?.some((o) => current.occasion?.includes(o))) s += 2
    const pd = Math.abs(p.price - current.price)
    if (pd < 5000) s += 2; else if (pd < 12000) s += 1
    return { p, s }
  })
  return scored.sort((a, b) => b.s - a.s).slice(0, count).map((x) => x.p)
}

// Client-side search across name, sku, fabric, colour, occasion, collection
export const searchProducts = (query) => {
  if (!query) return []
  const q = query.toLowerCase().trim()
  return PRODUCTS.filter((p) => {
    const hay = [
      p.name, p.sku, p.tagline, p.fabricType, p.colourFamily, p.colourName,
      p.collectionName, ...(p.occasion || []), p.description
    ].join(' ').toLowerCase()
    return hay.includes(q)
  }).slice(0, 8)
}

// Filter option builders for collection page
export const getFilterOptions = (products) => {
  const unique = (arr) => [...new Set(arr.filter(Boolean))]
  return {
    fabrics: unique(products.map((p) => p.fabricType)),
    colours: unique(products.map((p) => p.colourFamily)),
    occasions: unique(products.flatMap((p) => p.occasion || []))
  }
}
