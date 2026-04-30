const CACHE_NAME = 'chatt-cache-v1'
const CORE_ASSETS = ['/']
let unreadMessages = []
const MAX_STORED = 10

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

	// Не кэшировать API и WebSocket запросы
	if (
		url.pathname.startsWith('/api/') ||
		url.pathname.startsWith('/uploads/') ||
		url.pathname.startsWith('/ws')
	) {
		return
	}

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

			const body = data.body || ''

			let formattedTime = ''
			if (data.time) {
				const date = new Date(data.time)
				const hours = date.getHours().toString().padStart(2, '0')
				const minutes = date.getMinutes().toString().padStart(2, '0')
				formattedTime = `${hours}:${minutes}`
			}

			// Добавляем в массив непрочитанных
			unreadMessages.push({
				body,
				time: formattedTime,
			})

			// Ограничиваем размер
			if (unreadMessages.length > MAX_STORED) {
				unreadMessages = unreadMessages.slice(-MAX_STORED)
			}

			const count = unreadMessages.length
			const last = unreadMessages[unreadMessages.length - 1]

			// Формируем сводное уведомление
			const title =
				count === 1 ? 'Новое сообщение' : `Новые сообщения (${count})`

			const summaryBody =
				count === 1
					? `${last.body}\n${last.time}`
					: `${last.body}\n${last.time}\n+ ещё ${count - 1}`

			const options = {
				body: summaryBody,
				data: { count },
				icon: '/favicon.png',
				tag: 'chat-summary',
				renotify: true,
			}

			await self.registration.showNotification(title, options)
		})()
	)
})

self.addEventListener('notificationclick', (event) => {
	event.waitUntil(
		(async () => {
			// Очищаем все непрочитанные
			unreadMessages = []

			try {
				event.notification.close()
			} catch {}

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
