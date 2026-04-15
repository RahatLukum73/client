import type { ChatProfile } from '../../../features/auth/model/profile'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; ++i)
		outputArray[i] = rawData.charCodeAt(i)
	return outputArray
}

export async function subscribeForPush(profile: ChatProfile): Promise<void> {
	console.log('[Push] subscribeForPush called')

	if (!('serviceWorker' in navigator)) {
		console.warn('[Push] serviceWorker not supported')
		return
	}
	if (!('PushManager' in window)) {
		console.warn('[Push] PushManager not available')
		return
	}

	const permission = await Notification.requestPermission()
	console.log('[Push] Notification permission:', permission)
	if (permission !== 'granted') {
		console.warn('[Push] Notifications not granted, skipping subscription')
		return
	}

	const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
	console.log('[Push] VAPID key present:', !!publicKey)
	if (!publicKey) return

	const reg = await navigator.serviceWorker.ready
	const existing = await reg.pushManager.getSubscription()

	const subscription =
		existing ??
		(await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(publicKey)
				.buffer as ArrayBuffer,
		}))

	// Persist subscription on server.
	const wsUrl = import.meta.env.VITE_WS_URL as string | undefined

	if (!wsUrl) {
		console.warn('[Push] VITE_WS_URL is not set')
		return
	}

	// Convert wss:// → https:// (same host, different protocol)
	const API_URL = wsUrl
		.replace('wss://', 'https://')
		.replace('ws://', 'http://')

	console.log(
		'[Push] Sending subscription to:',
		`${API_URL}/api/push/subscribe`
	)

	const res = await fetch(`${API_URL}/api/push/subscribe`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			token: profile.sessionToken,
			subscription: {
				endpoint: subscription.endpoint,
				keys: subscription.toJSON(),
			},
		}),
	})

	if (!res.ok) {
		console.error('[Push] Subscribe failed:', res.status, res.statusText)
		return
	}

	console.log('[Push] Subscribed successfully')
}
