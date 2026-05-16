import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import type { ChatProfile } from '../../features/auth/model/profile'
import styles from './Layout.module.css'

type LayoutProps = {
	profile: ChatProfile
	wsStatus: 'disconnected' | 'connecting' | 'connected'
	joinRequestsCount: number
	children: React.ReactNode
}

export default function Layout(props: LayoutProps) {
	const { profile, wsStatus, joinRequestsCount, children } = props

	const navigate = useNavigate()
	const location = useLocation()

	const touchStartX = useRef(0)
	const touchEndX = useRef(0)

	const handleTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.changedTouches[0].screenX
	}

	const handleTouchEnd = (e: React.TouchEvent) => {
		touchEndX.current = e.changedTouches[0].screenX

		const deltaX = touchStartX.current - touchEndX.current

		// минимальная дистанция свайпа
		if (Math.abs(deltaX) < 50) return

		const current = location.pathname

		// свайп влево
		if (deltaX > 0) {
			if (current === '/chat') {
				navigate('/profile')
			} else if (current === '/profile') {
				navigate('/settings')
			}
		}

		// свайп вправо
		if (deltaX < 0) {
			if (current === '/settings') {
				navigate('/profile')
			} else if (current === '/profile') {
				navigate('/chat')
			}
		}
	}

	return (
		<div
			className={styles.shell}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
		>
			<Header
				profile={profile}
				wsStatus={wsStatus}
				joinRequestsCount={joinRequestsCount}
				isAdmin={profile.isAdmin}
			/>
			<main className={styles.main}>{children}</main>
		</div>
	)
}
