import { useState, useRef } from 'react'
import type { ChangeEvent } from 'react'
import styles from './MessageComposer.module.css'

type Attachment = {
	id: string
	file: File
	previewUrl: string
	uploading?: boolean
	error?: string
	serverId?: string
	url?: string
}

type MessageComposerProps = {
	onSendMessage: (text: string, attachmentIds?: string[]) => void
	disabled: boolean
	placeholder?: string
}

export default function MessageComposer(props: MessageComposerProps) {
	const { onSendMessage, disabled, placeholder = 'Сообщение...' } = props

	const [text, setText] = useState('')
	const [attachments, setAttachments] = useState<Attachment[]>([])
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
		setText(e.target.value)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	const handleAttachClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click()
		}
	}

	const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (!files || files.length === 0) return

		// Ограничение: максимум 5 файлов за раз
		const newFiles = Array.from(files).slice(0, 5 - attachments.length)

		for (const file of newFiles) {
			// Проверка типа файла (только изображения)
			if (!file.type.startsWith('image/')) {
				alert('Можно загружать только изображения')
				continue
			}

			// Проверка размера (5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert(`Файл ${file.name} слишком большой. Максимум 5MB`)
				continue
			}

			const previewUrl = URL.createObjectURL(file)
			const attachment: Attachment = {
				id: crypto.randomUUID(),
				file,
				previewUrl,
				uploading: false,
			}

			setAttachments((prev) => [...prev, attachment])

			// Загрузка файла на сервер
			await uploadFile(attachment)
		}

		// Сброс input для возможности повторного выбора того же файла
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const uploadFile = async (
		attachment: Attachment
	): Promise<string | null> => {
		try {
			setAttachments((prev) =>
				prev.map((a) =>
					a.id === attachment.id
						? { ...a, uploading: true, error: undefined }
						: a
				)
			)

			const formData = new FormData()
			formData.append('file', attachment.file)

			const jwt = localStorage.getItem('jwt')
			if (!jwt) {
				throw new Error('Не авторизован')
			}

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`Ошибка загрузки: ${response.status} ${errorText}`)
			}

			const data = await response.json()
			const attachmentId = data.id

			setAttachments((prev) =>
				prev.map((a) =>
					a.id === attachment.id
						? {
								...a,
								uploading: false,
								serverId: attachmentId,
								url: data.url,
							}
						: a
				)
			)

			return attachmentId
		} catch (error) {
			console.error('Upload failed:', error)
			setAttachments((prev) =>
				prev.map((a) =>
					a.id === attachment.id
						? {
								...a,
								uploading: false,
								error:
									error instanceof Error
										? error.message
										: 'Ошибка загрузки',
							}
						: a
				)
			)
			return null
		}
	}

	const removeAttachment = (id: string) => {
		setAttachments((prev) => {
			const attachment = prev.find((a) => a.id === id)
			if (attachment) {
				URL.revokeObjectURL(attachment.previewUrl)
			}
			return prev.filter((a) => a.id !== id)
		})
	}

	const handleSend = async () => {
		const trimmedText = text.trim()
		if (!trimmedText && attachments.length === 0) return

		// Получаем ID загруженных файлов с сервера
		const attachmentIds = attachments
			.filter((a) => !a.uploading && !a.error && a.serverId)
			.map((a) => a.serverId!)

		// Отправляем сообщение
		onSendMessage(
			trimmedText,
			attachmentIds.length > 0 ? attachmentIds : undefined
		)

		// Очищаем состояние
		setText('')
		attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl))
		setAttachments([])
	}

	const canSend =
		!disabled && (text.trim().length > 0 || attachments.length > 0)

	return (
		<div className={styles.composerWrapper}>
			<div className={styles.composer}>
				<div className={styles.inputContainer}>
					<input
						className={styles.inputComposer}
						value={text}
						onChange={handleTextChange}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						disabled={disabled}
					/>

					{attachments.length > 0 && (
						<div className={styles.previewContainer}>
							{attachments.map((attachment) => (
								<div key={attachment.id} className={styles.previewItem}>
									<img
										src={attachment.previewUrl}
										alt={attachment.file.name}
										className={styles.previewImage}
									/>
									{attachment.uploading && (
										<div
											style={{
												position: 'absolute',
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												background: 'rgba(0,0,0,0.5)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: '12px',
											}}
										>
											Загрузка...
										</div>
									)}
									{attachment.error && (
										<div
											style={{
												position: 'absolute',
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												background: 'rgba(239,68,68,0.7)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: '10px',
												padding: '4px',
												color: 'white',
											}}
										>
											Ошибка
										</div>
									)}
									<button
										className={styles.removeButton}
										onClick={() => removeAttachment(attachment.id)}
										type="button"
									>
										×
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className={styles.actions}>
					<button
						className={styles.attachButton}
						onClick={handleAttachClick}
						disabled={disabled || attachments.length >= 5}
						type="button"
						title="Прикрепить файл"
					>
						📎
					</button>

					<button
						className={styles.buttonSend}
						disabled={!canSend}
						onClick={handleSend}
						type="button"
					>
						Отправить
					</button>
				</div>

				<input
					ref={fileInputRef}
					type="file"
					className={styles.fileInput}
					accept="image/*"
					multiple
					onChange={handleFileSelect}
				/>
			</div>
		</div>
	)
}
