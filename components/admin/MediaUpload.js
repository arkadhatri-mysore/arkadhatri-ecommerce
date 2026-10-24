'use client'

import { useRef, useState } from 'react'
import { UploadCloud, Film, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { optimiseImage, uploadBlob, capturePoster, videoDuration } from '@/lib/upload-client'

const bar = (p) => (
  <div className="h-1.5 w-full bg-[#4A0F1C]/10 rounded overflow-hidden">
    <div className="h-full bg-[#C8A45A] transition-all duration-300" style={{ width: `${Math.round(p * 100)}%` }} />
  </div>
)

/* ------------------------------------------------------------------ */
/* Photos: drag & drop or tap to pick several from phone / computer    */
/* ------------------------------------------------------------------ */
export function ImageUploader({ onUploaded }) {
  const input = useRef(null)
  const [jobs, setJobs] = useState([]) // {key,name,progress,status,error}
  const [drag, setDrag] = useState(false)

  const update = (key, patch) => setJobs((js) => js.map((j) => (j.key === key ? { ...j, ...patch } : j)))

  const handle = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name))
    if (!files.length) return
    const batch = files.map((f, i) => ({ key: `${Date.now()}-${i}-${f.name}`, file: f, name: f.name, progress: 0, status: 'working' }))
    setJobs((js) => [...js, ...batch])
    // Upload one after another so photos keep the order they were picked in
    for (const j of batch) {
      try {
        update(j.key, { status: 'optimising' })
        const { blob, name, mime } = await optimiseImage(j.file)
        update(j.key, { status: 'uploading' })
        const res = await uploadBlob(blob, { name, mime, onProgress: (p) => update(j.key, { progress: p }) })
        update(j.key, { status: 'done', progress: 1 })
        onUploaded?.(res.url)
        setTimeout(() => setJobs((js) => js.filter((x) => x.key !== j.key)), 2500)
      } catch (e) {
        update(j.key, { status: 'error', error: e.message })
      }
    }
    if (input.current) input.current.value = ''
  }

  return (
    <div>
      <button
        type="button"
        data-testid="image-upload-dropzone"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files) }}
        className={`w-full border-2 border-dashed rounded-md px-4 py-8 flex flex-col items-center justify-center gap-2 transition-colors ${drag ? 'border-[#C8A45A] bg-[#C8A45A]/10' : 'border-[#4A0F1C]/20 hover:border-[#C8A45A] bg-[#F7F3EB]/50'}`}
      >
        <UploadCloud size={28} strokeWidth={1.4} className="text-[#C8A45A]" />
        <span className="font-inter text-sm font-medium text-[#4A0F1C]">Upload photos</span>
        <span className="font-inter text-xs text-[#4A0F1C]/60 text-center">Tap to choose from your phone or computer, or drag photos here. You can pick several at once.<br />JPG, PNG or WebP. They are resized automatically for fast loading.</span>
      </button>
      <input ref={input} data-testid="image-upload-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handle(e.target.files)} />
      {jobs.length > 0 && (
        <div className="mt-3 space-y-2">
          {jobs.map((j) => (
            <div key={j.key} className="border border-[#4A0F1C]/10 rounded p-2.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-inter text-xs text-[#4A0F1C] truncate">{j.name}</span>
                <span className="font-inter text-[11px] text-[#4A0F1C]/70 flex items-center gap-1 shrink-0">
                  {j.status === 'done' && <><CheckCircle2 size={13} className="text-green-700" /> Added</>}
                  {j.status === 'error' && <><AlertCircle size={13} className="text-red-700" /> Failed</>}
                  {j.status === 'optimising' && <><Loader2 size={13} className="animate-spin" /> Preparing</>}
                  {(j.status === 'uploading' || j.status === 'working') && <><Loader2 size={13} className="animate-spin" /> {Math.round(j.progress * 100)}%</>}
                  {j.status === 'error' && <button type="button" onClick={() => setJobs((js) => js.filter((x) => x.key !== j.key))} className="ml-1"><X size={13} /></button>}
                </span>
              </div>
              {j.status === 'error' ? <p className="font-inter text-xs text-red-700">{j.error}</p> : bar(j.progress)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Short product video (+ automatic cover frame)                        */
/* ------------------------------------------------------------------ */
export function VideoUploader({ videoUrl, videoPoster, onChange }) {
  const input = useRef(null)
  const [state, setState] = useState({ status: 'idle', progress: 0, error: '', note: '' })

  const handle = async (file) => {
    if (!file) return
    if (!/^video\//.test(file.type)) { setState({ status: 'error', error: 'Please choose a video file (MP4, MOV or WebM).' }); return }
    try {
      const dur = await videoDuration(file)
      const note = dur > 60 ? 'Tip: short clips of 10 to 30 seconds get the most attention.' : ''
      setState({ status: 'uploading', progress: 0, note })
      const poster = await capturePoster(file)
      let posterUrl = videoPoster
      if (poster) {
        const pr = await uploadBlob(poster, { name: 'poster.webp', mime: poster.type })
        posterUrl = pr.url
      }
      const res = await uploadBlob(file, { name: file.name, mime: file.type, onProgress: (p) => setState((s) => ({ ...s, progress: p })) })
      onChange?.({ videoUrl: res.url, videoPoster: posterUrl || '' })
      setState({ status: 'done', progress: 1, note })
    } catch (e) {
      setState({ status: 'error', error: e.message })
    }
    if (input.current) input.current.value = ''
  }

  return (
    <div className="space-y-3">
      {videoUrl ? (
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <video data-testid="video-preview" src={videoUrl} poster={videoPoster || undefined} muted loop playsInline autoPlay controls className="w-40 aspect-[9/16] object-cover rounded bg-black" />
          <div className="space-y-2">
            <p className="font-inter text-xs text-[#4A0F1C]/70">This video plays on the product page, on shop listings and in the homepage &ldquo;In Motion&rdquo; strip.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => input.current?.click()} className="font-inter text-sm px-3 py-1.5 border border-[#4A0F1C]/20 text-[#4A0F1C] rounded hover:border-[#C8A45A]">Replace video</button>
              <button type="button" data-testid="video-remove" onClick={() => onChange?.({ videoUrl: '', videoPoster: '' })} className="font-inter text-sm px-3 py-1.5 border border-red-200 text-red-700 rounded hover:bg-red-50">Remove</button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          data-testid="video-upload-dropzone"
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files?.[0]) }}
          disabled={state.status === 'uploading'}
          className="w-full border-2 border-dashed border-[#4A0F1C]/20 hover:border-[#C8A45A] bg-[#F7F3EB]/50 rounded-md px-4 py-8 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-70"
        >
          <Film size={28} strokeWidth={1.4} className="text-[#C8A45A]" />
          <span className="font-inter text-sm font-medium text-[#4A0F1C]">Upload a short video</span>
          <span className="font-inter text-xs text-[#4A0F1C]/60 text-center">A 10 to 30 second clip of the drape, pallu or zari works best. Upright (portrait) phone videos are ideal.<br />MP4, MOV or WebM, up to 200 MB. A cover image is created automatically.</span>
        </button>
      )}
      <input ref={input} data-testid="video-upload-input" type="file" accept="video/*" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      {state.status === 'uploading' && (
        <div className="space-y-1">
          <div className="font-inter text-xs text-[#4A0F1C]/70 flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" /> Uploading video… {Math.round(state.progress * 100)}%. Keep this page open.</div>
          {bar(state.progress)}
        </div>
      )}
      {state.status === 'done' && <p className="font-inter text-xs text-green-700">Video uploaded. Click <b>Save Changes</b> to publish it.</p>}
      {state.note && <p className="font-inter text-xs text-amber-800">{state.note}</p>}
      {state.status === 'error' && <p className="font-inter text-xs text-red-700">{state.error}</p>}
    </div>
  )
}
