import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Camera } from 'lucide-react'
import { getAllPhotoDates, getPhotosByDate, type StoredPhoto } from '@/lib/indexeddb'
import { formatDate } from '@/lib/utils'

export function PhotoTimeline() {
  const [dates, setDates] = useState<string[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<{ url: string; date: string }[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [comparePhotos, setComparePhotos] = useState<[string | null, string | null]>([null, null])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    getAllPhotoDates().then(setDates)
  }, [])

  const handleDateClick = async (date: string) => {
    const photos = await getPhotosByDate(date)
    const urls = photos.map((p: StoredPhoto) => ({
      url: URL.createObjectURL(p.blob),
      date: p.date,
    }))
    setSelectedPhotos(urls)
    setShowModal(true)
  }

  const handleCompareSelect = (url: string) => {
    if (comparePhotos[0] === null) {
      setComparePhotos([url, null])
    } else if (comparePhotos[1] === null) {
      setComparePhotos([comparePhotos[0], url])
    } else {
      setComparePhotos([url, null])
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Camera size={16} className="text-accent" />
            </div>
            <h3 className="font-bold font-[family-name:var(--font-display)] tracking-tight text-[15px]">Photo Timeline</h3>
          </div>
          {dates.length >= 2 && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                compareMode ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'text-text-muted hover:text-text-secondary bg-subtle-hover'
              }`}
            >
              Compare
            </button>
          )}
        </div>

        {dates.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-subtle">
            <Camera size={24} className="text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">No check-in photos yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => handleDateClick(date)}
                className="flex items-center gap-3 p-3.5 bg-subtle rounded-xl text-left hover:bg-card-hover transition-all duration-200 cursor-pointer border border-border-subtle"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/8 flex items-center justify-center">
                  <Camera size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-base font-medium">{formatDate(date)}</p>
                  <p className="text-sm text-text-muted">Check-in photo</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {compareMode && comparePhotos[0] && comparePhotos[1] && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <img src={comparePhotos[0]} alt="Before" className="w-full rounded-xl object-cover aspect-[3/4]" />
            <img src={comparePhotos[1]} alt="After" className="w-full rounded-xl object-cover aspect-[3/4]" />
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => {
        setShowModal(false)
        selectedPhotos.forEach((p) => URL.revokeObjectURL(p.url))
        setSelectedPhotos([])
      }} title="Check-in Photos">
        <div className="grid grid-cols-2 gap-2">
          {selectedPhotos.map((photo, i) => (
            <div key={i} className="relative">
              <img
                src={photo.url}
                alt={`Photo ${i + 1}`}
                className="w-full rounded-xl object-cover aspect-[3/4]"
              />
              {compareMode && (
                <button
                  onClick={() => handleCompareSelect(photo.url)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full glass text-white text-xs flex items-center justify-center cursor-pointer"
                >
                  {comparePhotos.includes(photo.url) ? '✓' : '+'}
                </button>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
