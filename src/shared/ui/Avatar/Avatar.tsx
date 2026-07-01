type AvatarProps = {
	name: string
	avatarUrl?: string
	backgroundColor: string
	children?: React.ReactNode
	size?: number
}

import styles from './Avatar.module.css'

export default function Avatar({
	name,
	avatarUrl,
	backgroundColor,
	children,
	size = 30,
}: AvatarProps) {
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

			{children}
		</div>
	)
}
