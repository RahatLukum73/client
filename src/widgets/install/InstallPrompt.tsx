import { useEffect, useState } from 'react'
import { useInstallPrompt } from '../../shared/lib/useInstallPrompt'
import styles from './InstallPrompt.module.css'

export default function InstallPrompt() {
	const { install, isInstallable, isIOS, isInstalled } = useInstallPrompt()

	const [visible, setVisible] = useState(false)

	useEffect(() => {
		if (isInstalled) return

		const dismissedAt = localStorage.getItem('install-dismissed-at')

		if (dismissedAt) {
			const diff = Date.now() - Number(dismissedAt)

			const days7 = 7 * 24 * 60 * 60 * 1000

			if (diff < days7) {
				return
			}
		}

		const timer = setTimeout(() => {
			setVisible(true)
		}, 3000)

		return () => clearTimeout(timer)
	}, [isInstalled])

	if (isInstalled || !visible) return null

	const close = () => {
		localStorage.setItem('install-dismissed-at', String(Date.now()))

		setVisible(false)
	}

	const shareIcon = (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 3L12 14"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M8 7L12 3L16 7"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M7 10H6C4.9 10 4 10.9 4 12V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V12C20 10.9 19.1 10 18 10H17"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	)

	return (
		<div className={styles.wrapper}>
			<div className={styles.card}>
				<div className={styles.title}>Установить приложение?</div>

				<div className={styles.text}>
					Установите Хутор как приложение для быстрого доступа и
					уведомлений.
				</div>

				{isIOS ? (
					<div className={styles.iosHint}>
						Нажмите {shareIcon} Поделиться → "На экран Домой"
					</div>
				) : isInstallable ? (
					<button className={styles.installButton} onClick={install}>
						Установить
					</button>
				) : null}

				<button className={styles.closeButton} onClick={close}>
					Позже
				</button>
			</div>
		</div>
	)
}
