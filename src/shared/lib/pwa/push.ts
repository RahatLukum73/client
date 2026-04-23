function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; ++i)
		outputArray[i] = rawData.charCodeAt(i)
	return outputArray
}

export async function subscribeForPush(jwtToken: string): Promise<void> {
	console.log('[Push] subscribeForPush called')

	if (!('serviceWorker' in navigator)) return
	if (!('PushManager' in window)) return

	const permission = await Notification.requestPermission()
	if (permission !== 'granted') return

	const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
	if (!publicKey) return

	const reg = await navigator.serviceWorker.ready

	const existing = await reg.pushManager.getSubscription()

	if (existing) {
		console.log('[Push] unsubscribe old subscription')
	}

	const applicationServerKey = urlBase64ToUint8Array(publicKey)

	const subscription = await reg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: applicationServerKey as unknown as BufferSource,
	})

	const API_URL = import.meta.env.VITE_WS_URL.replace(
		'wss://',
		'https://'
	).replace('ws://', 'http://')

	const payload = {
		endpoint: subscription.endpoint,
		keys: subscription.toJSON().keys,
	}

	await fetch(`${API_URL}/api/push/subscribe`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			Authorization: `Bearer ${jwtToken}`,
		},
		body: JSON.stringify({
			subscription: payload,
		}),
	})

	console.log('[Push] Subscribed OK')
}
