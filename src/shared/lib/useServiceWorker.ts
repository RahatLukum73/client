import { useEffect, useState } from 'react'

export type SWUpdateStatus = 'idle' | 'checking' | 'available' | 'updated'

export function useServiceWorker() {
	const [updateStatus, setUpdateStatus] = useState<SWUpdateStatus>('idle')
	const [swRegistration, setSwRegistration] =
		useState<ServiceWorkerRegistration | null>(null)

	useEffect(() => {
		if (!('serviceWorker' in navigator)) {
			console.warn('[SW] Service Worker не поддерживается')
			return
		}

		// Слушаем сообщения от Service Worker
		const handleMessage = (event: MessageEvent) => {
			console.log('[SW] Получено сообщение:', event.data)
			if (event.data?.type === 'NEW_VERSION_AVAILABLE') {
				setUpdateStatus('available')
			}
		}

		navigator.serviceWorker.addEventListener('message', handleMessage)

		// Проверяем, есть ли waiting SW
		const checkWaitingSW = async () => {
			try {
				const registration = await navigator.serviceWorker.getRegistration()
				console.log('[SW] Регистрация SW:', registration)

				if (registration) {
					setSwRegistration(registration)

					// Если есть waiting worker - обновление доступно
					if (registration.waiting) {
						console.log('[SW] Есть waiting Service Worker')
						setUpdateStatus('available')
					}
				}
			} catch (error) {
				console.error('[SW] Ошибка при проверке SW:', error)
			}
		}

		checkWaitingSW()

		return () => {
			navigator.serviceWorker.removeEventListener('message', handleMessage)
		}
	}, [])

	const applyUpdate = async () => {
		console.log('[SW] Применяем обновление')
		if (swRegistration?.waiting) {
			swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
			setUpdateStatus('updated')
			// Перезагрузка страницы
			window.location.reload()
		}
	}

	return {
		updateStatus,
		applyUpdate,
		hasUpdate: updateStatus === 'available',
		isUpdated: updateStatus === 'updated',
	}
}
