'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UploadedFile {
  localUrl: string   // object URL for preview
  storagePath: string
  name: string
  size: number
}

interface ImageUploadProps {
  userId: string
  minCount: number
  maxCount: number
  allowedTypes: string[]    // e.g. ['jpg','jpeg','png','webp']
  maxFileSizeMb: number
  guideText: string | null
  onChange: (paths: string[]) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function ImageUpload({
  userId,
  minCount,
  maxCount,
  allowedTypes,
  maxFileSizeMb,
  guideText,
  onChange,
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState<Record<string, number>>({})  // name → 0-100
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const typeLabel = allowedTypes.map(t => t.toUpperCase()).join(', ')
  const remaining = maxCount - files.length

  function validateFile(file: File): string | null {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!allowedTypes.includes(ext)) {
      return `"${file.name}": ${typeLabel} форматтай байх ёстой`
    }
    if (file.size > maxFileSizeMb * 1024 * 1024) {
      return `"${file.name}": ${maxFileSizeMb}MB-аас хэтэрч болохгүй (одоо ${formatBytes(file.size)})`
    }
    return null
  }

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    const err = validateFile(file)
    if (err) {
      setErrors(prev => [...prev, err])
      return null
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${userId}/${timestamp}-${safeName}`
    const localUrl = URL.createObjectURL(file)

    setUploading(prev => ({ ...prev, [file.name]: 0 }))

    const { error } = await supabase.storage
      .from('uploads')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    setUploading(prev => {
      const next = { ...prev }
      delete next[file.name]
      return next
    })

    if (error) {
      URL.revokeObjectURL(localUrl)
      setErrors(prev => [...prev, `"${file.name}": upload амжилтгүй болов`])
      return null
    }

    return { localUrl, storagePath, name: file.name, size: file.size }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, allowedTypes, maxFileSizeMb])

  async function processFiles(incoming: FileList | File[]) {
    setErrors([])
    const arr = Array.from(incoming)

    if (files.length + arr.length > maxCount) {
      setErrors([`Хамгийн ихдээ ${maxCount} зураг оруулах боломжтой`])
      return
    }

    const results = await Promise.all(arr.map(uploadFile))
    const uploaded = results.filter((r): r is UploadedFile => r !== null)

    setFiles(prev => {
      const next = [...prev, ...uploaded]
      onChange(next.map(f => f.storagePath))
      return next
    })
  }

  function removeFile(idx: number) {
    setFiles(prev => {
      URL.revokeObjectURL(prev[idx].localUrl)
      const next = prev.filter((_, i) => i !== idx)
      onChange(next.map(f => f.storagePath))
      return next
    })
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files)
  }

  const isUploading = Object.keys(uploading).length > 0

  return (
    <div style={{ background: '#12121C', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
        Зураг оруулах
        {minCount > 0 && (
          <span style={{ fontSize: 12, fontWeight: 400, color: '#EF4444', marginLeft: 6 }}>*</span>
        )}
      </div>
      {guideText && (
        <div style={{ fontSize: 12, color: '#52525B', marginBottom: 12 }}>{guideText}</div>
      )}

      {/* Dropzone */}
      {remaining > 0 && (
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? 'rgba(124,58,237,.6)' : 'rgba(255,255,255,.1)'}`,
            borderRadius: 10,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'border-color .2s, background .2s',
            background: dragging ? 'rgba(124,58,237,.06)' : 'transparent',
            marginBottom: files.length > 0 ? 12 : 0,
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 8, color: '#52525B' }}>⬆</div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            {isUploading ? 'Байршуулж байна...' : 'Зураг чирж тавих'}
          </div>
          <div style={{ fontSize: 12, color: '#52525B', marginBottom: 12 }}>
            {typeLabel} — {maxFileSizeMb}MB хүртэл
            {maxCount > 1 && ` · Үлдсэн: ${remaining}`}
          </div>
          {!isUploading && (
            <button
              type="button"
              style={{
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                color: '#A1A1AA',
                borderRadius: 8,
                padding: '7px 16px',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            >
              Файл сонгох
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={allowedTypes.map(t => `.${t}`).join(',')}
            multiple={maxCount > 1}
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.length) processFiles(e.target.files) }}
          />
        </div>
      )}

      {/* Previews */}
      {files.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))', gap: 8 }}>
          {files.map((f, i) => (
            <div key={f.storagePath} style={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.localUrl}
                alt={f.name}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,.08)',
                  display: 'block',
                }}
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                title="Устгах"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,.75)',
                  border: '1px solid rgba(255,255,255,.15)',
                  color: '#fff',
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  fontFamily: 'inherit',
                }}
              >
                ✕
              </button>
              <div style={{ fontSize: 9, color: '#52525B', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatBytes(f.size)}
              </div>
            </div>
          ))}
          {/* Uploading spinners */}
          {Object.keys(uploading).map(name => (
            <div key={name} style={{ aspectRatio: '1', borderRadius: 8, background: 'rgba(124,58,237,.08)', border: '1px dashed rgba(124,58,237,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(124,58,237,.2)', borderTop: '2px solid #7C3AED', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: '#EF4444', marginBottom: 4 }}>{e}</div>
          ))}
        </div>
      )}

      {/* Count indicator */}
      <div style={{ fontSize: 11, color: files.length >= minCount ? '#52525B' : '#EF4444', marginTop: 8 }}>
        {files.length}/{minCount === maxCount ? maxCount : `${minCount}–${maxCount}`} зураг
        {files.length < minCount && ` — дор хаяж ${minCount} зураг шаардлагатай`}
      </div>
    </div>
  )
}
