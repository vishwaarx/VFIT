import { supabase } from './supabase'

// Firebase is loaded dynamically to avoid crashing Safari
// (firebase/messaging throws at import time if Push API is unavailable)
let messaging: import('firebase/messaging').Messaging | null = null

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
}

export async function initFirebase() {
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase not configured. Push notifications disabled.')
    return
  }

  try {
    const { initializeApp } = await import('firebase/app')
    const { getMessaging } = await import('firebase/messaging')
    const app = initializeApp(firebaseConfig)
    messaging = getMessaging(app)
  } catch (err) {
    console.warn('Firebase init failed (Push API may not be supported):', err)
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const { getToken } = await import('firebase/messaging')
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string
    const token = await getToken(messaging, { vapidKey })

    // Store token in Supabase
    await supabase
      .from('notification_settings')
      .update({ fcm_token: token, push_enabled: true })
      .not('id', 'is', null) // Update the single row

    return token
  } catch (err) {
    console.warn('Failed to get FCM token:', err)
    return null
  }
}

export async function onForegroundMessage(callback: (payload: { title: string; body: string }) => void) {
  if (!messaging) return () => {}

  try {
    const { onMessage } = await import('firebase/messaging')
    return onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? 'VFIT'
      const body = payload.notification?.body ?? ''
      callback({ title, body })
    })
  } catch {
    return () => {}
  }
}
