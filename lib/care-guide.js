// Ready-made saree care & draping guide.
// Care tips depend on the fabric; draping steps are the same for every saree.
// Any saree can override the care tips (and add a draping note) from the Admin panel.

export const FABRIC_CARE = {
  kanjivaram: {
    title: 'Kanjivaram Silk',
    intro: 'A heavy, mulberry-silk weave with real zari. Treated gently, it lasts for generations.',
    tips: [
      'Dry-clean only for the first few washes. Never machine wash or wring.',
      'Fold it in a muslin or soft cotton cloth. Do not store it in plastic.',
      'Refold it along new lines every 2 to 3 months so the zari does not crack at the folds.',
      'Iron on low heat from the reverse, with a cotton cloth between the iron and the zari.',
      'Spray perfume and deodorant before you drape, never directly on the silk.',
      'Air it in the shade after wearing. Direct sunlight fades the colour.'
    ]
  },
  mysore: {
    title: 'Mysore Silk',
    intro: 'A light, fluid crêpe silk with a soft sheen. It needs less weight and more air.',
    tips: [
      'Dry-clean is best. If you must, hand-rinse in cold water with a mild silk wash, without soaking it.',
      'Never wring. Roll it in a towel to press out the water, then dry it flat in the shade.',
      'Iron on the silk setting while it is still slightly damp, on the reverse side.',
      'Hang it on a padded hanger or fold it loosely in muslin.',
      'Keep it away from rough jewellery and embellished bags that can snag the crêpe.'
    ]
  },
  silk: {
    title: 'Pure Silk',
    intro: 'Natural silk is strong but delicate. It loves cool, dry, dark storage.',
    tips: [
      'Dry-clean only. Avoid detergents, bleach and harsh stain removers.',
      'Store it folded in a muslin cloth, in a cool, dry wardrobe.',
      'Add neem leaves or a cedar block, not naphthalene balls, to keep moths away.',
      'Refold it every few months so the creases do not set.',
      'Iron on low heat from the reverse side, with a press cloth over the zari.',
      'Keep perfume, oils and water away from the fabric.'
    ]
  },
  cotton: {
    title: 'Handloom Cotton',
    intro: 'A breathable handloom that grows softer with every wash.',
    tips: [
      'For the first wash, soak it in cold salt water to set the colour, and wash it on its own.',
      'After that, hand-wash in cold water with a mild detergent.',
      'Dry it inside out in the shade to keep the colour.',
      'Starch lightly if you prefer a crisp drape.',
      'Iron on medium-high heat while it is slightly damp.'
    ]
  },
  default: {
    title: 'Your Saree',
    intro: 'A handcrafted piece. A little care keeps it looking new.',
    tips: [
      'Dry-clean is recommended for the first wash.',
      'Store it folded in a muslin or cotton cloth, away from sunlight.',
      'Refold it every few months so the creases do not set.',
      'Iron on low heat from the reverse side.',
      'Spray perfume before you drape, never directly on the fabric.'
    ]
  }
}

export const DRAPING_STEPS = [
  { t: 'Start at the navel', d: 'Wear a fitted petticoat and the heels you plan to wear. Tuck the plain end of the saree into the petticoat, just right of the navel, and take it once around your waist.' },
  { t: 'Set the length', d: 'Check that the hem just grazes the floor all the way round. Adjust it now, because it is hard to fix later.' },
  { t: 'Make the pleats', d: 'Gather 5 to 7 even pleats, each about 5 inches wide. Keep the zari border lined up from pleat to pleat.' },
  { t: 'Tuck the pleats', d: 'Hold the pleats together, facing left, and tuck them in neatly at the navel. A safety pin on the inside keeps them in place.' },
  { t: 'Bring the pallu over', d: 'Take the rest of the saree around once more, then lift the pallu over your left shoulder so it falls to about knee length.' },
  { t: 'Pin and finish', d: 'Pleat or spread the pallu as you like, pin it at the shoulder to the blouse, and lightly steam out any creases.' }
]

export const careKeyFor = (product = {}) => {
  const f = `${product.fabricType || ''} ${product.details?.Fabric || ''}`.toLowerCase()
  if (f.includes('kanjivaram') || f.includes('kanchi')) return 'kanjivaram'
  if (f.includes('mysore') || f.includes('crêpe') || f.includes('crepe')) return 'mysore'
  if (f.includes('cotton') || f.includes('linen')) return 'cotton'
  if (f.includes('silk')) return 'silk'
  return 'default'
}

/** Returns the guide to show for a product: custom tips (from admin) win over the fabric default. */
export const careGuideFor = (product = {}) => {
  const base = FABRIC_CARE[careKeyFor(product)]
  const custom = String(product.careTips || '')
    .split('\n').map((s) => s.replace(/^[-•*\s]+/, '').trim()).filter(Boolean)
  return {
    title: product.fabricType || base.title,
    intro: base.intro,
    tips: custom.length ? custom : base.tips,
    isCustom: custom.length > 0,
    drapingNote: String(product.drapingNote || '').trim(),
    steps: DRAPING_STEPS
  }
}
