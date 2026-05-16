import { useEffect } from 'react'
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
	const location = useLocation()
	const navigate = useNavigate()
	const { profile, wsStatus, joinRequestsCount, children } = props

	useEffect(() => {
	const handlePopState = () => {
		if (location.pathname !== '/chat') {
			navigate('/chat', { replace: true })
		}
	}

	window.addEventListener('popstate', handlePopState)

	return () => {
		window.removeEventListener('popstate', handlePopState)
	}
}, [location.pathname])

	return (
		<div className={styles.shell}>
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
