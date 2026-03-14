import { useState, useRef } from 'react'
import { Camera, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { savePhoto } from '@/lib/indexeddb'
import { supabase } from '@/lib/supabase'

interface PhotoCheckinInlineProps {
  onComplete: (count: number) => void
  disabled?: boolean
}

export function PhotoCheckinInline({ onComplete, disabled }: PhotoCheckinInlineProps) {
  const [photos, setPhotos] = useState<{ blob: Blob; url: string }[]>([])
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const blob = file as Blob
      const url = URL.createObjectURL(blob)
      setPhotos((prev) => [...prev, { blob, url }])
    }
  }

  const handleSave = async () => {
    if (photos.length === 0) return
    setSaving(true)

    const today = new Date().toISOString().split('T')[0]

    for (const photo of photos) {
      await savePhoto(today, photo.blob)
    }

    await supabase.from('photo_checkins').insert({
      date: today,
      photo_count: photos.length,
    })

    photos.forEach((p) => URL.revokeObjectURL(p.url))

    setSaving(false)
    onComplete(photos.length)
    setPhotos([])
  }

  return (
    <div className="flex gap-2.5 justify-start">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-accent/15">
        <Camera size={14} className="text-white" />
      </div>
      <div className="glass rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
        <p className="text-base text-text-secondary mb-2">Weekly check-in photo time!</p>

        {photos.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {photos.map((p, i) => (
              <img
                key={i}
                src={p.url}
                alt={`Check-in ${i + 1}`}
                className="w-20 h-20 object-cover rounded-xl"
              />
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleCapture}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || saving}
            className="gap-1 !rounded-xl"
          >
            <Camera size={16} />
            {photos.length > 0 ? 'Add More' : 'Take Photo'}
          </Button>
          {photos.length > 0 && (
            <Button
              size="sm"
              onClick={handleSave}
              loading={saving}
              disabled={disabled}
              className="gap-1 !rounded-xl"
            >
              <Check size={16} />
              Save ({photos.length})
            </Button>
          )}
        </div>
        <p className="text-xs text-text-muted mt-2">Photos stay on your device only</p>
      </div>
    </div>
  )
}
