// Media storage for product photos & videos.
// Files are stored in MongoDB GridFS (bucket "media"), so they live with the
// database: no extra cloud account needed, and they travel with backups/self-hosting.
// Uploads arrive in small chunks (to pass proxy body-size limits) and are
// assembled into GridFS on "complete".

import { GridFSBucket } from 'mongodb'
import { Readable } from 'stream'
import { v4 as uuidv4 } from 'uuid'

export const CHUNK_SIZE = 768 * 1024 // 768 KB per request (safe under 1 MB proxy limits)

export const ALLOWED = {
  'image/jpeg': { ext: 'jpg', kind: 'image', max: 15 * 1024 * 1024 },
  'image/png':  { ext: 'png', kind: 'image', max: 15 * 1024 * 1024 },
  'image/webp': { ext: 'webp', kind: 'image', max: 15 * 1024 * 1024 },
  'image/avif': { ext: 'avif', kind: 'image', max: 15 * 1024 * 1024 },
  'image/gif':  { ext: 'gif', kind: 'image', max: 15 * 1024 * 1024 },
  'video/mp4':  { ext: 'mp4', kind: 'video', max: 200 * 1024 * 1024 },
  'video/webm': { ext: 'webm', kind: 'video', max: 200 * 1024 * 1024 },
  'video/quicktime': { ext: 'mov', kind: 'video', max: 200 * 1024 * 1024 }
}

const bucket = (db) => new GridFSBucket(db, { bucketName: 'media' })

let indexed = false
async function ensureIndexes(db) {
  if (indexed) return
  await Promise.all([
    db.collection('upload_chunks').createIndex({ uploadId: 1, index: 1 }, { unique: true }).catch(() => {}),
    db.collection('upload_sessions').createIndex({ id: 1 }, { unique: true }).catch(() => {}),
    // Abandoned uploads are cleaned up automatically after 24h
    db.collection('upload_sessions').createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }).catch(() => {}),
    db.collection('upload_chunks').createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }).catch(() => {})
  ])
  indexed = true
}

export async function initUpload(db, { filename, mime, size }) {
  await ensureIndexes(db)
  const rule = ALLOWED[String(mime || '').toLowerCase()]
  if (!rule) throw Object.assign(new Error('This file type is not supported. Use JPG, PNG or WebP photos, or MP4/WebM/MOV videos.'), { status: 415 })
  const bytes = Number(size) || 0
  if (bytes <= 0) throw Object.assign(new Error('The file is empty.'), { status: 400 })
  if (bytes > rule.max) throw Object.assign(new Error(`File too large. Max ${Math.round(rule.max / 1024 / 1024)} MB for ${rule.kind}s.`), { status: 413 })
  const id = uuidv4()
  const totalChunks = Math.ceil(bytes / CHUNK_SIZE)
  await db.collection('upload_sessions').insertOne({
    id, filename: String(filename || 'file').slice(0, 200), mime: mime.toLowerCase(),
    size: bytes, totalChunks, kind: rule.kind, ext: rule.ext, createdAt: new Date()
  })
  return { uploadId: id, chunkSize: CHUNK_SIZE, totalChunks }
}

export async function putChunk(db, uploadId, index, buf) {
  const s = await db.collection('upload_sessions').findOne({ id: uploadId })
  if (!s) throw Object.assign(new Error('Upload session not found or expired.'), { status: 404 })
  const i = Number(index)
  if (!Number.isInteger(i) || i < 0 || i >= s.totalChunks) throw Object.assign(new Error('Invalid chunk index.'), { status: 400 })
  if (!buf?.length || buf.length > CHUNK_SIZE) throw Object.assign(new Error('Invalid chunk size.'), { status: 400 })
  await db.collection('upload_chunks').updateOne(
    { uploadId, index: i },
    { $set: { uploadId, index: i, data: buf, createdAt: new Date() } },
    { upsert: true }
  )
  return { ok: true, index: i }
}

export async function completeUpload(db, uploadId) {
  const s = await db.collection('upload_sessions').findOne({ id: uploadId })
  if (!s) throw Object.assign(new Error('Upload session not found or expired.'), { status: 404 })
  const count = await db.collection('upload_chunks').countDocuments({ uploadId })
  if (count !== s.totalChunks) throw Object.assign(new Error(`Upload incomplete (${count}/${s.totalChunks} parts). Please retry.`), { status: 400 })

  const fileId = `${uuidv4()}.${s.ext}`
  const cursor = db.collection('upload_chunks').find({ uploadId }).sort({ index: 1 })
  let written = 0
  async function* gen() {
    for await (const c of cursor) {
      const b = Buffer.from(c.data.buffer ?? c.data)
      written += b.length
      yield b
    }
  }
  await new Promise((resolve, reject) => {
    const up = bucket(db).openUploadStreamWithId(fileId, s.filename, {
      metadata: { mime: s.mime, kind: s.kind, originalName: s.filename, size: s.size }
    })
    Readable.from(gen()).pipe(up).on('error', reject).on('finish', resolve)
  })
  await db.collection('upload_chunks').deleteMany({ uploadId })
  await db.collection('upload_sessions').deleteOne({ id: uploadId })
  if (written !== s.size) {
    await bucket(db).delete(fileId).catch(() => {})
    throw Object.assign(new Error('Upload size mismatch. Please retry.'), { status: 400 })
  }
  return { id: fileId, url: `/api/media/${fileId}`, kind: s.kind, mime: s.mime, size: s.size }
}

/** Streams a stored file, with HTTP Range support (needed for video seeking on iPhone/Safari). */
export async function serveMedia(db, fileId, request) {
  const files = await db.collection('media.files').find({ _id: fileId }).limit(1).toArray()
  const f = files[0]
  if (!f) return new Response('Not found', { status: 404 })
  const total = f.length
  const mime = f.metadata?.mime || 'application/octet-stream'
  const etag = `"${fileId}"`
  const base = {
    'Content-Type': mime,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    ETag: etag
  }
  if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: base })

  const range = request.headers.get('range')
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range)
    let start = m && m[1] ? parseInt(m[1], 10) : 0
    let end = m && m[2] ? parseInt(m[2], 10) : total - 1
    if (m && !m[1] && m[2]) { start = Math.max(0, total - parseInt(m[2], 10)); end = total - 1 }
    if (isNaN(start) || isNaN(end) || start > end || start >= total) {
      return new Response(null, { status: 416, headers: { ...base, 'Content-Range': `bytes */${total}` } })
    }
    end = Math.min(end, total - 1)
    const stream = bucket(db).openDownloadStream(fileId, { start, end: end + 1 })
    return new Response(Readable.toWeb(stream), {
      status: 206,
      headers: { ...base, 'Content-Range': `bytes ${start}-${end}/${total}`, 'Content-Length': String(end - start + 1) }
    })
  }
  const stream = bucket(db).openDownloadStream(fileId)
  return new Response(Readable.toWeb(stream), { status: 200, headers: { ...base, 'Content-Length': String(total) } })
}

export async function deleteMedia(db, fileId) {
  await bucket(db).delete(fileId)
}
