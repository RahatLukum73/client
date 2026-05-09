import { useState } from 'react'
import ConfirmModal from '../../shared/ui/ConfirmModal/ConfirmModal'
import MessageItem from './MessageItem'
import type { ChatMessage } from '../../shared/entities/message/model'
import type { ChatProfile } from '../../features/auth/model/profile'
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
}) {
	const { profile, messages, isAdmin, onDeleteMessage } = props
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState<{
		messageId: string
		messageText: string
		isSelf: boolean
	} | null>(null)

	const groupedMessages = groupMessagesByDate(messages)

	const handleImageClick = (url: string) => {
		setSelectedImage(url)
	}

	const handleCloseModal = () => {
		setSelectedImage(null)
	}

	const openDeleteConfirm = (
		messageId: string,
		messageText: string,
		isSelf: boolean
	) => {
		// Проверяем права: админ может всё, пользователь — только своё
		if (!isAdmin && !isSelf) return
		setDeleteConfirm({ messageId, messageText, isSelf })
	}

	const closeDeleteConfirm = () => setDeleteConfirm(null)

	const handleDeleteConfirm = () => {
		if (deleteConfirm) {
			onDeleteMessage(deleteConfirm.messageId)
		}
		closeDeleteConfirm()
	}

	return (
		<div className={styles.messages} role="log" aria-live="polite">
			{groupedMessages.map((group, groupIndex) => (
				<div key={groupIndex}>
					<div className={styles.dateSeparator}>
						<div className={styles.dataSeparatorStyle}>{group.dateLabel}</div>
					</div>
					<div className={styles.dayGroup}>
						{group.messages.map((m) => (
							<MessageItem
								key={m.id}
								message={m}
								profile={profile}
								isAdmin={isAdmin}
								onDeleteMessage={onDeleteMessage}
								onImageClick={handleImageClick}
								onOpenDeleteConfirm={openDeleteConfirm}
							/>
						))}
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
			<ConfirmModal
				isOpen={deleteConfirm !== null}
				title="Удалить сообщение?"
				message={
					deleteConfirm?.isSelf
						? 'Вы уверены, что хотите удалить своё сообщение?'
						: 'Вы уверены, что хотите удалить это сообщение?'
				}
				confirmText="Удалить"
				cancelText="Отмена"
				confirmVariant="danger"
				onConfirm={handleDeleteConfirm}
				onCancel={closeDeleteConfirm}
			/>
		</div>
	)
}
