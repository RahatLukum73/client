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
