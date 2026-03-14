// Shared FCM push notification sender for all edge functions
// Uses FCM HTTP v1 API with service account credentials

interface FCMPayload {
  title: string
  body: string
  data?: Record<string, string>
}

export async function sendPushNotification(
  fcmToken: string,
  payload: FCMPayload,
): Promise<boolean> {
  const serviceAccount = JSON.parse(
    Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ?? '{}',
  )

  if (!serviceAccount.project_id || !fcmToken) {
    console.warn('FCM not configured or no token — skipping push')
    return false
  }

  try {
    // Get OAuth2 access token from service account
    const accessToken = await getAccessToken(serviceAccount)

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.data ?? {},
            webpush: {
              fcm_options: {
                link: '/',
              },
            },
          },
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('FCM send failed:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('FCM send error:', err)
    return false
  }
}

async function getAccessToken(
  serviceAccount: Record<string, string>,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = btoa(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  )

  const signInput = `${header}.${claim}`

  // Import private key and sign JWT
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n')
  const keyData = pemToArrayBuffer(privateKey)
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signInput),
  )

  const jwt = `${signInput}.${btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')}`

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')
  const binary = atob(b64)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i)
  }
  return buffer.buffer
}
