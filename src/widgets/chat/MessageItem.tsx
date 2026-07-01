import { useLongPress } from '../../shared/lib/hooks/useLongPress'
import { getUsernameColor } from '../../shared/lib/hooks/getUsernameColor'
import type { ChatMessage } from '../../shared/entities/message/model'
import type { ChatProfile } from '../../features/auth/model/profile'
import LinkifiedText from '../../shared/ui/LinkifiedText/LinkifiedText'
import Avatar from '../../shared/ui/Avatar/Avatar'
import styles from './MessageList.module.css'

type MessageItemProps = {
	message: ChatMessage
	profile: ChatProfile
	isAdmin: boolean
	onDeleteMessage: (messageId: string) => void
	onImageClick: (url: string) => void
	onOpenDeleteConfirm: (
		messageId: string,
		messageText: string,
		isSelf: boolean
	) => void
}

export default function MessageItem(props: MessageItemProps) {
	const { message, profile, onImageClick, onOpenDeleteConfirm } = props

	const isSelf = message.author.id === profile.userId
	const authorColor = getUsernameColor(message.author.id)

	const longPressProps = useLongPress({
		onLongPress: () => onOpenDeleteConfirm(message.id, message.text, isSelf),
		delay: 600,
	})

	const hasOnlyImage =
		!message.text &&
		message.attachments?.length === 1 &&
		message.attachments[0].mimeType.startsWith('image/')

	const bubbleClass = `
	${styles.bubble}
	${isSelf ? styles.bubbleSelf : ''}
	${styles.bubbleLongPress}
	${hasOnlyImage ? styles.bubbleImageOnly : ''}
`

	const finalBubbleClass = bubbleClass

	return (
		<div className={isSelf ? `${styles.row} ${styles.rowSelf}` : styles.row}>
			{!isSelf ? (
				<Avatar
					userId={message.author.id}
					name={message.author.name}
					avatarUrl={message.author.avatarUrl}
					backgroundColor={authorColor}
				/>
			) : null}

			<div
				className={finalBubbleClass}
				{...longPressProps}
				onContextMenu={(e) => {
					e.preventDefault()
					e.stopPropagation()
				}}
			>
				<div className={styles.bubbleMeta}>
					<div>
						<span
							className={styles.author}
							style={{ color: authorColor }}
						>
							{message.author.name}
						</span>
						<span className={styles.timestamp}>
							{formatTime(message.timestamp)}
						</span>
					</div>
				</div>
				{message.text && (
					<div className={styles.text}>
						<LinkifiedText text={message.text} />
					</div>
				)}
				{message.attachments && message.attachments.length > 0 && (
					<div className={styles.attachmentsContainer}>
						{message.attachments.map((attachment) => (
							<div
								key={attachment.id}
								className={styles.attachment}
								onClick={() => onImageClick(attachment.url)}
							>
								{attachment.mimeType.startsWith('image/') ? (
									<img
										src={attachment.url}
										alt={attachment.filename}
										className={styles.attachmentImage}
										loading="lazy"
									/>
								) : (
									<a
										href={attachment.url}
										download={attachment.filename}
										className={styles.attachmentFile}
										onClick={(e) => e.stopPropagation()}
									>
										<div className={styles.fileIcon}>
											{getFileIcon(attachment.mimeType)}
										</div>
										<div className={styles.fileInfo}>
											<div className={styles.fileName}>
												{attachment.filename}
											</div>
											<div className={styles.fileSize}>
												{formatFileSize(attachment.size)}
											</div>
										</div>
									</a>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{isSelf ? (
				<Avatar
					userId={profile.userId}
					name={profile.name}
					avatarUrl={profile.avatarUrl}
					backgroundColor={authorColor}
				/>
			) : null}
		</div>
	)
}

function formatTime(timestamp: string): string {
	const date = new Date(timestamp)
	const hours = date.getHours().toString().padStart(2, '0')
	const minutes = date.getMinutes().toString().padStart(2, '0')
	return `${hours}:${minutes}`
}

function getFileIcon(mimeType: string): string {
	if (mimeType.includes('pdf')) return '📄'
	if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
	if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊'
	if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
		return '📽'
	if (mimeType.includes('text')) return '📃'
	if (mimeType.includes('zip')) return '📦'
	if (mimeType.startsWith('audio/')) return '🎵'
	return '📎'
}

function formatFileSize(bytes?: number): string {
	if (!bytes) return ''
	const sizes = ['B', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return Math.round((bytes / Math.pow(1024, i)) * 10) / 10 + ' ' + sizes[i]
}
