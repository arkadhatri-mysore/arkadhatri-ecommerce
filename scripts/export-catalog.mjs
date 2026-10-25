// Exports ONLY portable, non-customer shop data: products, non-secret shop settings, and uploaded
// product/homepage media (GridFS bucket "media"). Never exports orders, customers, newsletter,
// contact messages, admin users, tokens, codes, sessions or rate-limit data.
// Usage: MONGO_URL=... DB_NAME=... node scripts/export-catalog.mjs [outDir]
import { MongoClient, BSON } from 'mongodb'
import { mkdirSync, writeFileSync } from 'node:fs'

const out = process.argv[2] || 'data/catalog-export'
const SETTINGS_KEYS = ['shippingFlat', 'freeShippingThreshold', 'contactEmail', 'contactPhone', 'whatsappNumber', 'instagram', 'youtube', 'pinterest', 'facebook',
  'heroHeadline', 'heroSubtitle', 'heroCtaLabel', 'heroImage', 'storyTitle', 'storyText', 'seoTitle', 'seoDescription', 'businessName']

if (!process.env.MONGO_URL || !process.env.DB_NAME) { console.error('Set MONGO_URL and DB_NAME'); process.exit(1) }
const client = await new MongoClient(process.env.MONGO_URL).connect()
const db = client.db(process.env.DB_NAME)
mkdirSync(out, { recursive: true })
const save = (name, docs) => { writeFileSync(`${out}/${name}.json`, BSON.EJSON.stringify(docs, null, 1, { relaxed: false })); console.log(`${name}: ${docs.length}`) }

const products = await db.collection('products').find({}, { projection: { _id: 0 } }).toArray()
save('products', products)
const s = (await db.collection('settings').findOne({ id: 'main' })) || {}
const settings = Object.fromEntries([['id', 'main'], ...SETTINGS_KEYS.filter((k) => s[k] !== undefined).map((k) => [k, s[k]])])
save('settings', [settings])
// Only media actually used by products / homepage settings (skips abandoned or test uploads)
const used = [...new Set([...JSON.stringify([products, settings]).matchAll(/\/api\/media\/([A-Za-z0-9-]+\.[a-z0-9]+)/g)].map((m) => m[1]))]
save('media.files', await db.collection('media.files').find({ _id: { $in: used } }).toArray())
save('media.chunks', await db.collection('media.chunks').find({ files_id: { $in: used } }).toArray())
await client.close()
