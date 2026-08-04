// Central product catalogue — mirror of homepage featured sarees.
// Slugs are used for dynamic /product/[slug] routing.

export const PRODUCTS = [
  {
    slug: 'kavya',
    name: 'Kavya',
    tagline: 'Kanjivaram Silk • Deep Ruby',
    price: 24500,
    currency: '₹',
    collection: 'Silk Sarees',
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
      Occasion: 'Wedding · Reception · Grand festive gatherings.',
      'Blouse Piece': '0.8 m unstitched contrast blouse in ruby with matching zari border.',
      'Wash Care': 'Dry-clean only. Store folded in a muslin cloth. Do not spray perfume directly on the fabric.',
      Delivery: 'Complimentary delivery across Karnataka within 3–5 working days. India: 5–8 working days.',
      Returns: 'Easy 7-day return on all pieces. The saree must be unworn, with original packaging.'
    }
  },
  {
    slug: 'bhavana',
    name: 'Bhavana',
    tagline: 'Mysore Silk • Royal Purple',
    price: 18900,
    currency: '₹',
    collection: 'Silk Sarees',
    images: [
      'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1610047614256-023d7c028d0b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1598616068517-c75ad397a436?auto=format&fit=crop&w=1200&q=85'
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
    }
  },
  {
    slug: 'meenakshi',
    name: 'Meenakshi',
    tagline: 'Temple Border • Bridal Red',
    price: 38500,
    currency: '₹',
    collection: 'Wedding Sarees',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85'
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
    }
  },
  {
    slug: 'anjali',
    name: 'Anjali',
    tagline: 'Festival Silk • Emerald & Gold',
    price: 22900,
    currency: '₹',
    collection: 'Festival Sarees',
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
      Occasion: 'Diwali · Ugadi · Festive gatherings · Family functions.',
      'Blouse Piece': '0.8 m unstitched blouse in matching emerald.',
      'Wash Care': 'Dry-clean only. Store folded, refold every three months.',
      Delivery: 'Karnataka: 3–5 working days. India: 5–8 working days.',
      Returns: '7-day easy return, unworn condition with original packaging.'
    }
  },
  {
    slug: 'lakshmi',
    name: 'Lakshmi',
    tagline: 'Kanjivaram Silk • Bridal Gold',
    price: 26400,
    currency: '₹',
    collection: 'Wedding Sarees',
    images: [
      'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=1200&q=85'
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
    }
  },
  {
    slug: 'anagha',
    name: 'Anagha',
    tagline: 'Zari Border • Antique Gold',
    price: 19500,
    currency: '₹',
    collection: 'Festival Sarees',
    images: [
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1610047614256-023d7c028d0b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1779167327071-963220d85043?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1598616068517-c75ad397a436?auto=format&fit=crop&w=1200&q=85'
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
    }
  },
  {
    slug: 'radhika',
    name: 'Radhika',
    tagline: 'Handwoven Silk • Traditional Weave',
    price: 21900,
    currency: '₹',
    collection: 'Daily Wear Sarees',
    images: [
      'https://images.unsplash.com/photo-1564656622440-e6206eb5ee63?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1598616068517-c75ad397a436?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1779167327071-963220d85043?auto=format&fit=crop&w=1200&q=85'
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
    }
  },
  {
    slug: 'rukmini',
    name: 'Rukmini',
    tagline: 'Heritage Silk • Zari Detail',
    price: 42000,
    currency: '₹',
    collection: 'Wedding Sarees',
    images: [
      'https://images.unsplash.com/photo-1779167327071-963220d85043?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1200&q=85',
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
    }
  }
]

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug)

export const getRelated = (slug, count = 4) =>
  PRODUCTS.filter((p) => p.slug !== slug).slice(0, count)
