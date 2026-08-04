// Central product catalogue with SKU + SEO fields.
// Adding a new saree = adding one entry here. UI updates automatically.

export const PRODUCTS = [
  {
    slug: 'kavya', sku: 'ARK-KV-001', name: 'Kavya',
    tagline: 'Kanjivaram Silk \u2022 Deep Ruby',
    price: 24500, currency: '\u20b9',
    collection: 'silk-sarees',
    collectionName: 'Silk Sarees',
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1564656622440-e6206eb5ee63?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1779167327071-963220d85043?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A deep ruby Kanjivaram silk, woven with contrast temple borders and a heavy zari pallu. Composed at our atelier in Karnataka and suited to the most considered wedding wardrobes.',
    details: {
      Fabric: 'Pure Kanjivaram silk, mulberry-fibre.',
      Colour: 'Deep ruby with antique-gold zari.',
      Occasion: 'Wedding \u00b7 Reception \u00b7 Grand festive gatherings.',
      'Blouse Piece': '0.8 m unstitched contrast blouse in ruby with matching zari border.',
      'Wash Care': 'Dry-clean only. Store folded in a muslin cloth. Do not spray perfume directly on the fabric.',
      Delivery: 'Complimentary delivery across Karnataka within 3\u20135 working days. India: 5\u20138 working days.',
      Returns: 'Easy 7-day return on all pieces. The saree must be unworn, with original packaging.'
    },
    seoTitle: 'Kavya \u2013 Kanjivaram Silk Saree in Deep Ruby | ARKADHATRI',
    seoDescription: 'Kavya is a Kanjivaram silk saree in deep ruby with temple borders and gold zari. Handpicked in Karnataka by ARKADHATRI.'
  },
  {
    slug: 'bhavana', sku: 'ARK-BH-002', name: 'Bhavana',
    tagline: 'Mysore Silk \u2022 Royal Purple',
    price: 18900, currency: '\u20b9',
    collection: 'silk-sarees', collectionName: 'Silk Sarees', isNew: false,
    images: [
      'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1610047614256-023d7c028d0b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1598616068517-c75ad397a436?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A regal Mysore silk in royal purple, edged with a slim zari border. Fluid drape, quiet weight \u2014 an heirloom for anniversaries, receptions and temple visits.',
    details: {
      Fabric: 'Pure Mysore cr\u00eape silk with fine zari.',
      Colour: 'Royal purple with muted gold border.',
      Occasion: 'Reception \u00b7 Sangeet \u00b7 Anniversary \u00b7 Temple visits.',
      'Blouse Piece': '0.8 m unstitched blouse in matching purple silk.',
      'Wash Care': 'Dry-clean only. Store folded, away from direct sunlight.',
      Delivery: 'Karnataka: 3\u20135 working days. India: 5\u20138 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Bhavana \u2013 Mysore Silk Saree in Royal Purple | ARKADHATRI',
    seoDescription: 'Bhavana is a Mysore silk saree in royal purple with fine zari border. A quietly regal piece from ARKADHATRI, Karnataka.'
  },
  {
    slug: 'meenakshi', sku: 'ARK-MK-003', name: 'Meenakshi',
    tagline: 'Temple Border \u2022 Bridal Red',
    price: 38500, currency: '\u20b9',
    collection: 'wedding-sarees', collectionName: 'Wedding Sarees', isNew: false,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A bridal saree composed with a heavy temple-motif border and an intricate zari pallu \u2014 designed to be a lasting keepsake for the bride.',
    details: {
      Fabric: 'Pure Kanjivaram silk with 24k gilded silver zari.',
      Colour: 'Bridal red with antique-gold temple border.',
      Occasion: 'Bridal \u00b7 Muhurtham \u00b7 Wedding day.',
      'Blouse Piece': '0.8 m unstitched contrast blouse in bridal red with zari border.',
      'Wash Care': 'Dry-clean only. Store folded in muslin. Refold every three months.',
      Delivery: 'Karnataka: 3\u20135 working days. India: 5\u20138 working days. Insured white-glove delivery.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Meenakshi \u2013 Bridal Kanjivaram Saree | Temple Border | ARKADHATRI',
    seoDescription: 'Meenakshi is a bridal Kanjivaram silk saree with a heavy temple motif border and intricate zari pallu. Handpicked by ARKADHATRI.'
  },
  {
    slug: 'anjali', sku: 'ARK-AJ-004', name: 'Anjali',
    tagline: 'Festival Silk \u2022 Emerald & Gold',
    price: 22900, currency: '\u20b9',
    collection: 'festival-sarees', collectionName: 'Festival Sarees', isNew: false,
    images: [
      'https://images.unsplash.com/photo-1610047614256-023d7c028d0b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1564656622440-e6206eb5ee63?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A festival silk in deep emerald with a broad antique-gold border. Elegant, understated, and suited to Diwali evenings, temple functions and family celebrations.',
    details: {
      Fabric: 'Pure silk with zari border.',
      Colour: 'Emerald green with antique-gold border.',
      Occasion: 'Diwali \u00b7 Ugadi \u00b7 Festive gatherings \u00b7 Family functions.',
      'Blouse Piece': '0.8 m unstitched blouse in matching emerald.',
      'Wash Care': 'Dry-clean only. Store folded, refold every three months.',
      Delivery: 'Karnataka: 3\u20135 working days. India: 5\u20138 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Anjali \u2013 Emerald Festival Silk Saree | ARKADHATRI',
    seoDescription: 'Anjali is a festival silk saree in emerald green with antique-gold border. A refined piece for Diwali and temple gatherings.'
  },
  {
    slug: 'lakshmi', sku: 'ARK-LK-005', name: 'Lakshmi',
    tagline: 'Kanjivaram Silk \u2022 Bridal Gold',
    price: 26400, currency: '\u20b9',
    collection: 'wedding-sarees', collectionName: 'Wedding Sarees', isNew: true,
    images: [
      'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A ceremonial Kanjivaram in warm bridal gold \u2014 the piece for the family bride who chooses grace over grandeur.',
    details: {
      Fabric: 'Pure Kanjivaram silk with 24k gilded zari.',
      Colour: 'Bridal gold with contrast red pallu.',
      Occasion: 'Bridal \u00b7 Muhurtham \u00b7 Reception.',
      'Blouse Piece': '0.8 m unstitched contrast red blouse with zari border.',
      'Wash Care': 'Dry-clean only. Store folded in muslin.',
      Delivery: 'Karnataka: 3\u20135 working days. India: 5\u20138 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Lakshmi \u2013 Bridal Gold Kanjivaram Saree | ARKADHATRI',
    seoDescription: 'Lakshmi is a ceremonial Kanjivaram in bridal gold with a contrast red pallu. Curated by ARKADHATRI, Karnataka.'
  },
  {
    slug: 'anagha', sku: 'ARK-AN-006', name: 'Anagha',
    tagline: 'Zari Border \u2022 Antique Gold',
    price: 19500, currency: '\u20b9',
    collection: 'festival-sarees', collectionName: 'Festival Sarees', isNew: false,
    images: [
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1610047614256-023d7c028d0b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1779167327071-963220d85043?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1598616068517-c75ad397a436?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A pure silk with antique-gold zari border and an intricate hand-inlaid pallu \u2014 a piece for festive evenings and family celebrations.',
    details: {
      Fabric: 'Pure silk with hand-inlaid zari.',
      Colour: 'Rich mustard body with antique-gold border.',
      Occasion: 'Festive \u00b7 Family functions \u00b7 Temple visits.',
      'Blouse Piece': '0.8 m unstitched blouse in matching silk.',
      'Wash Care': 'Dry-clean only.',
      Delivery: 'Karnataka: 3\u20135 working days. India: 5\u20138 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Anagha \u2013 Antique Gold Zari Silk Saree | ARKADHATRI',
    seoDescription: 'Anagha is a pure silk saree with antique-gold zari border and hand-inlaid pallu. For festive evenings, from ARKADHATRI.'
  },
  {
    slug: 'radhika', sku: 'ARK-RD-007', name: 'Radhika',
    tagline: 'Handwoven Silk \u2022 Traditional Weave',
    price: 21900, currency: '\u20b9',
    collection: 'everyday-elegance', collectionName: 'Everyday Elegance', isNew: true,
    images: [
      'https://images.unsplash.com/photo-1564656622440-e6206eb5ee63?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1598616068517-c75ad397a436?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1779167327071-963220d85043?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A softly handwoven silk in a traditional weave \u2014 quiet enough for the workday, refined enough for a soir\u00e9e.',
    details: {
      Fabric: 'Handwoven pure silk.',
      Colour: 'Warm ochre body with muted zari border.',
      Occasion: 'Everyday elegance \u00b7 Office \u00b7 Small gatherings.',
      'Blouse Piece': '0.8 m unstitched blouse in matching silk.',
      'Wash Care': 'Dry-clean only.',
      Delivery: 'Karnataka: 3\u20135 working days. India: 5\u20138 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Radhika \u2013 Handwoven Silk Saree | Everyday Elegance | ARKADHATRI',
    seoDescription: 'Radhika is a handwoven silk saree in ochre with muted zari border \u2014 refined everyday elegance from ARKADHATRI.'
  },
  {
    slug: 'rukmini', sku: 'ARK-RK-008', name: 'Rukmini',
    tagline: 'Heritage Silk \u2022 Zari Detail',
    price: 42000, currency: '\u20b9',
    collection: 'wedding-sarees', collectionName: 'Wedding Sarees', isNew: true,
    images: [
      'https://images.unsplash.com/photo-1779167327071-963220d85043?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85'
    ],
    description: 'A heritage silk composed with fine zari detailing across the pallu and border \u2014 an heirloom-in-the-making.',
    details: {
      Fabric: 'Pure heritage silk with hand-inlaid zari.',
      Colour: 'Deep crimson with 24k gilded zari.',
      Occasion: 'Bridal \u00b7 Wedding \u00b7 Muhurtham.',
      'Blouse Piece': '0.8 m unstitched contrast blouse with zari border.',
      'Wash Care': 'Dry-clean only. Store folded in muslin.',
      Delivery: 'Karnataka: 3\u20135 working days. India: 5\u20138 working days. Insured white-glove delivery.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    },
    seoTitle: 'Rukmini \u2013 Heritage Silk Saree with Zari Detail | ARKADHATRI',
    seoDescription: 'Rukmini is a heritage silk saree in deep crimson with fine zari detailing \u2014 an heirloom-in-the-making from ARKADHATRI.'
  }
]

export const COLLECTIONS = [
  { slug: 'silk-sarees',        name: 'Silk Sarees',        tag: 'The Signature Weave', desc: 'The signature ARKADHATRI weave \u2014 pure silk composed for the woman who values timeless elegance.', image: 'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=1600&q=85' },
  { slug: 'wedding-sarees',     name: 'Wedding Sarees',     tag: 'For The Bride',       desc: 'Kanjivaram silks and heritage pieces composed for muhurtham, reception and the days that stay in memory.',              image: 'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=1600&q=85' },
  { slug: 'festival-sarees',    name: 'Festival Sarees',    tag: 'Occasion Silks',      desc: 'Refined silks for Diwali, Ugadi, temple visits and gatherings that matter.',                                                image: 'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1600&q=85' },
  { slug: 'everyday-elegance',  name: 'Everyday Elegance',  tag: 'Daily Wear Sarees',   desc: 'Softly handwoven pieces quiet enough for the workday and refined enough for a soir\u00e9e.',                                image: 'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1600&q=85' },
  { slug: 'new-arrivals',       name: 'New Arrivals',       tag: 'Just In',             desc: 'The latest sarees to arrive at the atelier.',                                                                                     image: 'https://images.unsplash.com/photo-1610047614256-023d7c028d0b?auto=format&fit=crop&w=1600&q=85' }
]

export const getProduct   = (slug) => PRODUCTS.find((p) => p.slug === slug)
export const getCollection = (slug) => COLLECTIONS.find((c) => c.slug === slug)
export const getProductsByCollection = (slug) => slug === 'new-arrivals' ? PRODUCTS.filter((p) => p.isNew) : PRODUCTS.filter((p) => p.collection === slug)
export const getRelated   = (slug, count = 4) => PRODUCTS.filter((p) => p.slug !== slug).slice(0, count)
