import { openDB, type IDBPDatabase } from 'idb'
import { uuid } from '@/lib/utils'

const DB_NAME = 'vfit-photos'
const DB_VERSION = 1
const STORE_NAME = 'checkin-photos'

interface StoredPhoto {
  id: string
  date: string
  blob: Blob
  type: string
  createdAt: string
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('by-date', 'date')
        }
      },
    })
  }
  return dbPromise
}

export async function savePhoto(date: string, blob: Blob): Promise<string> {
  const db = await getDB()
  const id = uuid()
  const photo: StoredPhoto = {
    id,
    date,
    blob,
    type: blob.type,
    createdAt: new Date().toISOString(),
  }
  await db.put(STORE_NAME, photo)
  return id
}

export async function getPhotosByDate(date: string): Promise<StoredPhoto[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE_NAME, 'by-date', date)
}

export async function getAllPhotoDates(): Promise<string[]> {
  const db = await getDB()
  const all = await db.getAllKeys(STORE_NAME)
  const photos = await Promise.all(all.map((key) => db.get(STORE_NAME, key)))
  const dates = [...new Set(photos.filter(Boolean).map((p: StoredPhoto) => p.date))]
  return dates.sort().reverse()
}

export async function getPhotoBlob(id: string): Promise<Blob | null> {
  const db = await getDB()
  const photo = await db.get(STORE_NAME, id) as StoredPhoto | undefined
  return photo?.blob ?? null
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export type { StoredPhoto }
