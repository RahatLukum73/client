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
			const registration = await navigator.serviceWorker.register('/sw.js', {
				type: 'module',
			})

			console.log('[SW] Service Worker зарегистрирован', registration)

			// Слушаем сообщения от Service Worker
			navigator.serviceWorker.addEventListener('message', (event) => {
				if (event.data?.type === 'NEW_VERSION_AVAILABLE') {
					console.log('[SW] Доступна новая версия приложения')
				}
			})

			// Проверяем, есть ли waiting SW сразу после регистрации
			if (registration.waiting) {
				console.log('[SW] Есть обновлённый SW в очереди')
			}

			// Периодическая проверка обновлений (каждые 4 часа)
			setInterval(
				async () => {
					await registration.update()
					console.log('[SW] Проверка обновлений')
				},
				4 * 60 * 60 * 1000
			)
		} catch (error) {
			console.error('[SW] Ошибка регистрации Service Worker:', error)
		}
	})
}
