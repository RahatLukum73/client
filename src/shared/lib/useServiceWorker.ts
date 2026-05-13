import { useState } from 'react'

export function useServiceWorker() {
	const [isUpdating, setIsUpdating] = useState(false)

	const checkForUpdates = async () => {
		if (!('serviceWorker' in navigator)) return

		try {
			setIsUpdating(true)

			const registration =
				await navigator.serviceWorker.getRegistration()

			if (!registration) {
				window.location.reload()
				return
			}

			console.log('[SW] checking updates')

			// Проверяем обновления
			await registration.update()

			// Даём время браузеру скачать новый SW
			await new Promise((resolve) =>
				setTimeout(resolve, 1000)
			)

			// Если новый SW готов
			if (registration.waiting) {
				console.log('[SW] update found')

				registration.waiting.postMessage({
					type: 'SKIP_WAITING',
				})

				// Небольшая задержка
				setTimeout(() => {
					window.location.reload()
				}, 500)

				return
			}

			console.log('[SW] no updates')

			alert('У вас уже последняя версия')

			// Всё равно форсим reload
			window.location.reload()
		} catch (error) {
			console.error('[SW] update failed', error)
		} finally {
			setIsUpdating(false)
		}
	}

	return {
		checkForUpdates,
		isUpdating,
	}
}