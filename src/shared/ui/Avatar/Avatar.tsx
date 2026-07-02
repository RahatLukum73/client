import { useOnlineUsers } from '../../../features/online/model/useOnlineUsers'
import { getUsernameColor } from '../../../shared/lib/hooks/getUsernameColor'
import styles from './Avatar.module.css'

type AvatarSize = 'sm' | 'md' | 'lg'

type AvatarProps = {
	userId: string
	name: string
	avatarUrl?: string
	showOnline?: boolean
	size?: AvatarSize
}

export default function Avatar({
	userId,
	name,
	avatarUrl,
	showOnline = true,
	size = 'md',
}: AvatarProps) {
	const onlineUsers = useOnlineUsers()

	const isOnline = onlineUsers.has(userId)

	const avatarLetter = (name?.[0] ?? '?').toUpperCase()

	const backgroundColor = getUsernameColor(userId)

	return (
		<div className={`${styles.wrapper} ${styles[size]}`}>
			<div className={styles.avatar} style={{ backgroundColor }}>
				{avatarUrl ? (
					<img src={avatarUrl} alt={name} className={styles.image} />
				) : (
					avatarLetter
				)}
			</div>

			{showOnline && isOnline && <div className={styles.onlineDot} />}
		</div>
	)
}
