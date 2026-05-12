import { useEffect, useState } from 'react'

export function useServiceWorker() {
	const [hasUpdate, setHasUpdate] = useState(false)

	useEffect(() => {
		const handler = () => {
			console.log('[SW] update available')
			setHasUpdate(true)
		}

		window.addEventListener('sw-update-available', handler)

		return () => {
			window.removeEventListener('sw-update-available', handler)
		}
	}, [])

	const applyUpdate = async () => {
		const registration = await navigator.serviceWorker.getRegistration()

		if (registration?.waiting) {
			registration.waiting.postMessage({
				type: 'SKIP_WAITING',
			})

			// Когда новый SW активируется
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				window.location.reload()
			})
		}
	}

	return {
		hasUpdate,
		applyUpdate,
	}
}
