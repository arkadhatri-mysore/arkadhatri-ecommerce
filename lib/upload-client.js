'use client'

// Browser-side helpers for admin media uploads.
// Photos are resized (max 2000px) and converted to WebP before upload: smaller, faster pages.
// Files are sent in small chunks with automatic retries, so big videos work on mobile data too.

const MAX_EDGE = 2400

const toBlob = (canvas, type, q) => new Promise((res) => canvas.toBlob(res, type, q))

export async function optimiseImage(file) {
  const type = (file.type || '').toLowerCase()
  if (type === 'image/gif') return { blob: file, name: file.name, mime: type }
  let bmp
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    if (/heic|heif/.test(type) || /\.(heic|heif)$/i.test(file.name)) {
      throw new Error('iPhone HEIC photos are not supported in this browser. Set your camera to "Most Compatible", or share the photo as JPG.')
    }
    if (['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(type)) return { blob: file, name: file.name, mime: type }
    throw new Error('This photo format is not supported. Use JPG, PNG or WebP.')
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height))
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  canvas.getContext('2d').drawImage(bmp, 0, 0, w, h)
  bmp.close?.()
  const out = await toBlob(canvas, 'image/webp', 0.92)
  if (!out || out.type !== 'image/webp') {
    const jpg = await toBlob(canvas, 'image/jpeg', 0.88)
    return { blob: jpg || file, name: file.name.replace(/\.[^.]+$/, '') + '.jpg', mime: jpg ? 'image/jpeg' : type }
  }
  // Keep the original if it is already smaller and a web-friendly format
  if (out.size > file.size && ['image/jpeg', 'image/webp'].includes(type) && scale === 1) {
    return { blob: file, name: file.name, mime: type }
  }
  return { blob: out, name: file.name.replace(/\.[^.]+$/, '') + '.webp', mime: 'image/webp' }
}

/** Grabs a still frame from a video file to use as its cover (poster) image. */
export function capturePoster(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url
    const done = (blob) => { URL.revokeObjectURL(url); resolve(blob) }
    const timer = setTimeout(() => done(null), 15000)
    v.onloadedmetadata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 3) }
    v.onseeked = async () => {
      try {
        const scale = Math.min(1, 1600 / Math.max(v.videoWidth, v.videoHeight))
        const c = document.createElement('canvas')
        c.width = Math.round(v.videoWidth * scale); c.height = Math.round(v.videoHeight * scale)
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height)
        const b = await toBlob(c, 'image/webp', 0.85) || await toBlob(c, 'image/jpeg', 0.88)
        clearTimeout(timer); done(b)
      } catch { clearTimeout(timer); done(null) }
    }
    v.onerror = () => { clearTimeout(timer); done(null) }
  })
}

export function videoDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    v.preload = 'metadata'; v.src = url
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(v.duration || 0) }
    v.onerror = () => { URL.revokeObjectURL(url); resolve(0) }
  })
}

const jsonOrThrow = async (r) => {
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.error || `Upload failed (${r.status})`)
  return d
}

/** Uploads a Blob/File in chunks. onProgress(0..1). Resolves to { url, kind, mime, size }. */
export async function uploadBlob(blob, { name, mime, onProgress } = {}) {
  const init = await jsonOrThrow(await fetch('/api/admin/uploads', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: name || 'file', mime: mime || blob.type, size: blob.size })
  }))
  const { uploadId, chunkSize, totalChunks } = init
  for (let i = 0; i < totalChunks; i++) {
    const part = blob.slice(i * chunkSize, Math.min(blob.size, (i + 1) * chunkSize))
    let attempt = 0
    for (;;) {
      try {
        await jsonOrThrow(await fetch(`/api/admin/uploads/${uploadId}/chunks/${i}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: part
        }))
        break
      } catch (e) {
        if (++attempt >= 4) throw e
        await new Promise((r) => setTimeout(r, 600 * attempt))
      }
    }
    onProgress?.((i + 1) / (totalChunks + 0.2))
  }
  const done = await jsonOrThrow(await fetch(`/api/admin/uploads/${uploadId}/complete`, { method: 'POST' }))
  onProgress?.(1)
  return done
}
