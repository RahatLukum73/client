import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>
	userChoice: Promise<{
		outcome: 'accepted' | 'dismissed'
	}>
}

export function useInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null)

	const [isInstallable, setIsInstallable] = useState(false)

	const [isIOS, setIsIOS] = useState(false)

	const [isInstalled, setIsInstalled] = useState(false)

	useEffect(() => {
		// iPhone detection
		const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent)

		setIsIOS(ios)

		// Уже установлено?
		const standalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone

		setIsInstalled(standalone)

		// Android install prompt
		const handler = (e: Event) => {
			e.preventDefault()

			setDeferredPrompt(e as BeforeInstallPromptEvent)

			setIsInstallable(true)
		}

		window.addEventListener('beforeinstallprompt', handler)

		return () => {
			window.removeEventListener('beforeinstallprompt', handler)
		}
	}, [])

	const install = async () => {
		if (!deferredPrompt) return

		await deferredPrompt.prompt()

		const choice = await deferredPrompt.userChoice

		if (choice.outcome === 'accepted') {
			setIsInstallable(false)
		}
	}

	return {
		install,
		isInstallable,
		isIOS,
		isInstalled,
	}
}
