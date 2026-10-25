// Imports the portable shop data produced by export-catalog.mjs into a NEW database (e.g. MongoDB Atlas).
// Upserts products (by id) and media (by _id); merges non-secret settings. Safe to re-run.
// Usage: MONGO_URL=... DB_NAME=... node scripts/import-catalog.mjs [inDir]
import { MongoClient, BSON } from 'mongodb'
import { readFileSync, existsSync } from 'node:fs'

const dir = process.argv[2] || 'data/catalog-export'
if (!process.env.MONGO_URL || !process.env.DB_NAME) { console.error('Set MONGO_URL and DB_NAME'); process.exit(1) }
const load = (n) => (existsSync(`${dir}/${n}.json`) ? BSON.EJSON.parse(readFileSync(`${dir}/${n}.json`, 'utf8'), { relaxed: false }) : [])
const client = await new MongoClient(process.env.MONGO_URL).connect()
const db = client.db(process.env.DB_NAME)

let n = 0
for (const p of load('products')) { await db.collection('products').updateOne({ id: p.id }, { $set: p }, { upsert: true }); n++ }
console.log('products upserted:', n)
for (const s of load('settings')) { await db.collection('settings').updateOne({ id: 'main' }, { $set: { ...s, id: 'main', updatedAt: new Date() } }, { upsert: true }) }
console.log('settings merged')
for (const col of ['media.files', 'media.chunks']) {
  let c = 0
  for (const d of load(col)) { await db.collection(col).replaceOne({ _id: d._id }, d, { upsert: true }); c++ }
  console.log(col, c)
}
await db.collection('media.chunks').createIndex({ files_id: 1, n: 1 }, { unique: true }).catch(() => {})
await db.collection('products').createIndex({ sku: 1 }, { unique: true }).catch(() => {})
await client.close()
console.log('done')
