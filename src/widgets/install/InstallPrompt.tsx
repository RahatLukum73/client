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
						Нажмите ⬆️ Share → "На экран Домой"
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
