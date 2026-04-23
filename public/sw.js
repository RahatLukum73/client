const CACHE_NAME = 'chatt-cache-v1'
const CORE_ASSETS = ['/']

self.addEventListener('install', (event) => {
	self.skipWaiting()
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(CORE_ASSETS))
			.catch(() => {})
	)
})

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))
				).then(() => {})
			)
	)
})

self.addEventListener('fetch', (event) => {
	const req = event.request
	if (req.method !== 'GET') return

	const url = new URL(req.url)
	if (url.origin !== self.location.origin) return

	event.respondWith(
		caches.match(req).then((cached) => {
			if (cached) return cached
			return fetch(req)
				.then((res) => {
					const copy = res.clone()
					caches
						.open(CACHE_NAME)
						.then((cache) => cache.put(req, copy))
						.catch(() => {})
					return res
				})
				.catch(() => cached)
		})
	)
})

self.addEventListener('push', (event) => {
	console.log('[SW] push received', event)
	event.waitUntil(
		(async () => {
			let data = {}
			try {
				data = event.data ? event.data.json() : {}
			} catch {
				data = {}
			}
			console.log('[SW] parsed data:', data)

			const title = data.title || 'Уведомление'
			const body = data.body || ''

			let formattedTime = ''
			if (data.time) {
				const date = new Date(data.time)
				const hours = date.getHours().toString().padStart(2, '0')
				const minutes = date.getMinutes().toString().padStart(2, '0')
				formattedTime = `${hours}:${minutes}`
			}

			const bodyWithTime = formattedTime ? `${body}\n${formattedTime}` : body

			// Уникальный тег для каждого уведомления
			const uniqueTag = `chat-msg-${Date.now()}-${Math.random().toString(36).slice(2)}`

			const options = {
				body: bodyWithTime,
				data: {
					group: 'chat-group',
				},
				icon: '/favicon.png',
				tag: uniqueTag,
				renotify: true,
			}

			await self.registration.showNotification(title, options)
		})()
	)
})

self.addEventListener('notificationclick', (event) => {
	event.waitUntil(
		(async () => {
			// Закрываем все уведомления из чат-группы
			const notifications = await self.registration.getNotifications()
			for (const notification of notifications) {
				if (notification.tag && notification.tag.startsWith('chat-msg-')) {
					try {
						notification.close()
					} catch {}
				}
			}

			const clientList = await self.clients.matchAll({
				type: 'window',
				includeUncontrolled: true,
			})

			for (const client of clientList) {
				if (
					client.url &&
					client.url.startsWith(self.location.origin + '/')
				) {
					await client.focus()
					return
				}
			}

			await self.clients.openWindow('/')
		})()
	)
})
