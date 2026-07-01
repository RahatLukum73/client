import { useOnlineUsers } from '../../../features/online/model/useOnlineUsers'
import styles from './Avatar.module.css'

type AvatarProps = {
	userId: string
	name: string
	avatarUrl?: string
	backgroundColor: string
	children?: React.ReactNode
	size?: number
}

export default function Avatar({
	userId,
	name,
	avatarUrl,
	backgroundColor,
	children,
	size = 30,
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
				className={styles.avatar}
				style={{
					backgroundColor,
				}}
			>
				{avatarUrl ? (
					<img src={avatarUrl} alt={name} className={styles.image} />
				) : (
					avatarLetter
				)}
			</div>
			{isOnline && <div className={styles.onlineDot}></div>}
			{children}
		</div>
	)
}
