import { useOnlineUsers } from '../../../features/online/model/useOnlineUsers'
import styles from './Avatar.module.css'

type AvatarProps = {
	userId: string
	name: string
	avatarUrl?: string
	children?: React.ReactNode
	size?: number
	showOnline?: boolean
	showBorder?: boolean
}

export default function Avatar({
	userId,
	name,
	avatarUrl,
	children,
	size = 30,
	showOnline = true,
	showBorder = false,
}: AvatarProps) {
	const onlineUsers = useOnlineUsers()
	const isOnline = onlineUsers.has(userId)
	const avatarLetter = (name?.[0] ?? '?').toUpperCase()

	return (
		<div
			className={styles.wrapper}
			style={{
				width: size,
				height: size,
			}}
		>
			<div
				className={`${styles.avatar} ${
					showBorder ? styles.avatarBorder : ''
				}`}
			>
				{avatarUrl ? (
					<img src={avatarUrl} alt={name} className={styles.image} />
				) : (
					avatarLetter
				)}
			</div>
			{showOnline && isOnline && <div className={styles.onlineDot}></div>}
			{children}
		</div>
	)
}
