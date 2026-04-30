import { NavLink, useLocation } from 'react-router-dom'
import type { ChatProfile } from '../../features/auth/model/profile'
import styles from './Header.module.css'

type HeaderProps = {
	profile: ChatProfile
	wsStatus: 'disconnected' | 'connecting' | 'connected'
	joinRequestsCount: number
	isAdmin: boolean
}

// SVG иконки
const ChatIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
		<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
	</svg>
)

const ProfileIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
		<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
	</svg>
)

const SettingsIcon = ({ hasNotifications }: { hasNotifications: boolean }) => (
	<div style={{ position: 'relative' }}>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
			<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.44.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
		</svg>
		{hasNotifications && <span className={styles.notificationDot} />}
	</div>
)

export default function Header(props: HeaderProps) {
	const { profile, wsStatus, joinRequestsCount, isAdmin } = props
	const location = useLocation()

	const getStatusClass = () => {
		if (wsStatus === 'connected') return styles.online
		if (wsStatus === 'connecting') return styles.connecting
		return styles.offline
	}

	return (
		<div className={styles.header}>
			<div className={styles.headerLeft}>
				<div className={styles.avatar}>
					{profile.avatarUrl ? (
						<img
							src={profile.avatarUrl}
							alt={profile.name}
							className={styles.avatarImage}
						/>
					) : (
						profile.name.slice(0, 1).toUpperCase()
					)}
				</div>
				<div className={styles.userInfo}>
					<div className={styles.userName}>{profile.name}</div>
					<div className={styles.admirRow}>
						<div className={styles.isAdmin}>
							{isAdmin && <span className={styles.badge}>admin</span>}
						</div>
						<div className={`${styles.status} ${getStatusClass()}`}>
							{wsStatus === 'connected'
								? 'online'
								: wsStatus === 'connecting'
									? 'connecting...'
									: 'offline'}
						</div>
					</div>
				</div>
			</div>

			<div className={styles.headerRight}>
				<nav className={styles.nav}>
					<NavLink
						to="/chat"
						className={({ isActive }) =>
							`${styles.navButton} ${isActive ? styles.active : ''}`
						}
					>
						<span className={styles.icon}>
							<ChatIcon />
						</span>
						<span className={styles.label}>Чат</span>
					</NavLink>

					<NavLink
						to="/profile"
						className={({ isActive }) =>
							`${styles.navButton} ${isActive ? styles.active : ''}`
						}
					>
						<span className={styles.icon}>
							<ProfileIcon />
						</span>
						<span className={styles.label}>Профиль</span>
					</NavLink>

					<NavLink
						to="/settings"
						className={({ isActive }) =>
							`${styles.navButton} ${isActive ? styles.active : ''}`
						}
					>
						<span className={styles.icon}>
							<SettingsIcon hasNotifications={joinRequestsCount > 0} />
						</span>
						<span className={styles.label}>
							Настройки
							{joinRequestsCount > 0 && ` (${joinRequestsCount})`}
						</span>
					</NavLink>
				</nav>
			</div>
		</div>
	)
}
