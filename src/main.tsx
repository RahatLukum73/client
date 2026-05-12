import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './app/telegram.css'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)

// Service Worker + push subscriptions for PWA.
if ('serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		try {
			const registration = await navigator.serviceWorker.register('/sw.js?v=2')

			console.log('[SW] registered')

			// Проверяем обновления
			registration.onupdatefound = () => {
				console.log('[SW] update found')

				const newWorker = registration.installing

				if (!newWorker) return

				newWorker.onstatechange = () => {
					console.log('[SW] state:', newWorker.state)

					// Новый SW установлен
					if (
						newWorker.state === 'installed' &&
						navigator.serviceWorker.controller
					) {
						console.log('[SW] NEW VERSION AVAILABLE')

						window.dispatchEvent(new CustomEvent('sw-update-available'))
					}
				}
			}

			// Проверка обновлений каждые 5 минут
			setInterval(
				() => {
					registration.update()
				},
				5 * 60 * 1000
			)
		} catch (err) {
			console.error('[SW] registration failed', err)
		}
	})
}
