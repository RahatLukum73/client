import { useState } from 'react'
import type {
	ChatMessage,
	ChatAttachment,
} from '../../shared/entities/message/model'
import type { ChatProfile } from '../../features/auth/model/profile'
import LinkifiedText from '../../shared/ui/LinkifiedText/LinkifiedText'
import styles from './MessageList.module.css'

// Функция для форматирования даты в "Сегодня", "Вчера" или "15 марта"
function formatDateLabel(date: Date): string {
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)

	const isToday =
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()

	const isYesterday =
		date.getDate() === yesterday.getDate() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getFullYear() === yesterday.getFullYear()

	if (isToday) return 'Сегодня'
	if (isYesterday) return 'Вчера'

	// Формат "15 марта"
	const day = date.getDate()
	const monthNames = [
		'января',
		'февраля',
		'марта',
		'апреля',
		'мая',
		'июня',
		'июля',
		'августа',
		'сентября',
		'октября',
		'ноября',
		'декабря',
	]
	const month = monthNames[date.getMonth()]

	return `${day} ${month}`
}

// Функция для форматирования времени в "14:30"
function formatTime(timestamp: string): string {
	const date = new Date(timestamp)
	const hours = date.getHours().toString().padStart(2, '0')
	const minutes = date.getMinutes().toString().padStart(2, '0')
	return `${hours}:${minutes}`
}

// Функция для группировки сообщений по датам
function groupMessagesByDate(messages: ChatMessage[]): Array<{
	dateLabel: string
	date: Date
	messages: ChatMessage[]
}> {
	if (messages.length === 0) return []

	const groups: Map<string, { date: Date; messages: ChatMessage[] }> =
		new Map()

	messages.forEach((message) => {
		const date = new Date(message.timestamp)
		// Нормализуем до начала дня для группировки
		const dateKey = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate()
		).toISOString()

		if (!groups.has(dateKey)) {
			groups.set(dateKey, {
				date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
				messages: [],
			})
		}

		groups.get(dateKey)!.messages.push(message)
	})

	// Преобразуем в массив и сортируем по дате (от старых к новым)
	return Array.from(groups.entries())
		.map(([_, group]) => ({
			dateLabel: formatDateLabel(group.date),
			date: group.date,
			messages: group.messages.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
			),
		}))
		.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export default function MessageList(props: {
	profile: ChatProfile
	messages: ChatMessage[]
	isAdmin: boolean
	onDeleteMessage: (messageId: string) => void
	onKickUser: (userId: string) => void
}) {
	const { profile, messages, isAdmin, onDeleteMessage, onKickUser } = props
	const [selectedImage, setSelectedImage] = useState<string | null>(null)

	const groupedMessages = groupMessagesByDate(messages)

	const handleImageClick = (url: string) => {
		setSelectedImage(url)
	}

	const handleCloseModal = () => {
		setSelectedImage(null)
	}

	return (
		<div className={styles.messages} role="log" aria-live="polite">
			{groupedMessages.map((group, groupIndex) => (
				<div key={groupIndex}>
					<div className={styles.dateSeparator}>{group.dateLabel}</div>
					<div className={styles.dayGroup}>
						{group.messages.map((m) => {
							const isSelf = m.author.id === profile.userId
							const avatarLetter = (
								m.author.name?.[0] ?? '?'
							).toUpperCase()
							const showKick = isAdmin && m.author.id !== profile.userId

							return (
								<div
									key={m.id}
									className={
										isSelf
											? `${styles.row} ${styles.rowSelf}`
											: styles.row
									}
								>
									{!isSelf ? (
										<div className={styles.avatar} aria-hidden="true">
											{avatarLetter}
										</div>
									) : null}

									<div
										className={
											isSelf
												? `${styles.bubble} ${styles.bubbleSelf}`
												: styles.bubble
										}
									>
										<div className={styles.bubbleMeta}>
											<div>
												<span className={styles.author}>
													{m.author.name}
												</span>
												<span className={styles.timestamp}>
													{formatTime(m.timestamp)}
												</span>
											</div>
											{isAdmin ? (
												<div className={styles.bubbleActions}>
													{showKick ? (
														<button
															className={styles.link}
															onClick={() =>
																onKickUser(m.author.id)
															}
															type="button"
														>
															Кик
														</button>
													) : null}
													{m.author.id ? (
														<button
															className={styles.link}
															onClick={() =>
																onDeleteMessage(m.id)
															}
															type="button"
														>
															Удалить
														</button>
													) : null}
												</div>
											) : null}
										</div>
										<div className={styles.text}>
											<LinkifiedText text={m.text} />
										</div>
										{m.attachments && m.attachments.length > 0 && (
											<div className={styles.attachmentsContainer}>
												{m.attachments.map((attachment) => (
													<div
														key={attachment.id}
														className={styles.attachment}
														onClick={() =>
															handleImageClick(attachment.url)
														}
													>
														{attachment.mimeType.startsWith(
															'image/'
														) ? (
															<img
																src={attachment.url}
																alt={attachment.filename}
																className={
																	styles.attachmentImage
																}
																loading="lazy"
															/>
														) : (
															<div
																className={
																	styles.attachmentInfo
																}
															>
																📎 {attachment.filename}
															</div>
														)}
													</div>
												))}
											</div>
										)}
									</div>

									{isSelf ? (
										<div className={styles.avatar} aria-hidden="true">
											{avatarLetter}
										</div>
									) : null}
								</div>
							)
						})}
					</div>
				</div>
			))}
			{selectedImage && (
				<div className={styles.modalOverlay} onClick={handleCloseModal}>
					<div
						className={styles.modalContent}
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={selectedImage}
							alt="Увеличенное изображение"
							className={styles.modalImage}
						/>
						<button
							className={styles.modalClose}
							onClick={handleCloseModal}
						>
							×
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
