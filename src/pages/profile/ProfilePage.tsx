import { useState } from 'react'
import type { ChatProfile } from '../../features/auth/model/profile'
import styles from './ProfilePage.module.css'

type ProfilePageProps = {
	profile: ChatProfile
}

export default function ProfilePage(props: ProfilePageProps) {
	const { profile } = props

	// Состояние для редактирования имени
	const [name, setName] = useState(profile.name)
	const [isEditingName, setIsEditingName] = useState(false)
	const [nameLoading, setNameLoading] = useState(false)
	const [nameMessage, setNameMessage] = useState<{
		type: 'success' | 'error'
		text: string
	} | null>(null)

	// Состояние для смены пароля
	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [passwordLoading, setPasswordLoading] = useState(false)
	const [passwordMessage, setPasswordMessage] = useState<{
		type: 'success' | 'error'
		text: string
	} | null>(null)

	// Состояние для загрузки аватара
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const [avatarLoading, setAvatarLoading] = useState(false)
	const [avatarMessage, setAvatarMessage] = useState<{
		type: 'success' | 'error'
		text: string
	} | null>(null)

	// Аватар пользователя (буква или изображение)
	const avatarLetter = profile.name.slice(0, 1).toUpperCase()

	const handleNameSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim() || name === profile.name) {
			setIsEditingName(false)
			return
		}

		setNameLoading(true)
		setNameMessage(null)

		try {
			const jwt = localStorage.getItem('jwt')
			if (!jwt) throw new Error('Не авторизован')

			const response = await fetch('/api/profile/name', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${jwt}`,
				},
				body: JSON.stringify({ name: name.trim() }),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Ошибка при обновлении имени')
			}

			setNameMessage({ type: 'success', text: 'Имя успешно обновлено' })
			setIsEditingName(false)
		} catch (error) {
			console.error('Failed to update name:', error)
			setNameMessage({
				type: 'error',
				text:
					error instanceof Error
						? error.message
						: 'Ошибка при обновлении имени',
			})
		} finally {
			setNameLoading(false)
		}
	}

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (newPassword !== confirmPassword) {
			setPasswordMessage({ type: 'error', text: 'Пароли не совпадают' })
			return
		}

		if (newPassword.length < 6) {
			setPasswordMessage({
				type: 'error',
				text: 'Пароль должен быть не менее 6 символов',
			})
			return
		}

		setPasswordLoading(true)
		setPasswordMessage(null)

		try {
			const jwt = localStorage.getItem('jwt')
			if (!jwt) throw new Error('Не авторизован')

			const response = await fetch('/api/profile/password', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${jwt}`,
				},
				body: JSON.stringify({
					oldPassword,
					newPassword,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Ошибка при смене пароля')
			}

			setPasswordMessage({ type: 'success', text: 'Пароль успешно изменён' })
			setOldPassword('')
			setNewPassword('')
			setConfirmPassword('')
		} catch (error) {
			console.error('Failed to change password:', error)
			setPasswordMessage({
				type: 'error',
				text:
					error instanceof Error
						? error.message
						: 'Ошибка при смене пароля',
			})
		} finally {
			setPasswordLoading(false)
		}
	}

	const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			setAvatarMessage({
				type: 'error',
				text: 'Можно загружать только изображения',
			})
			return
		}

		if (file.size > 5 * 1024 * 1024) {
			setAvatarMessage({
				type: 'error',
				text: 'Файл слишком большой. Максимум 5MB',
			})
			return
		}

		setAvatarFile(file)
		const previewUrl = URL.createObjectURL(file)
		setAvatarPreview(previewUrl)
		setAvatarMessage(null)
	}

	const handleAvatarUpload = async () => {
		if (!avatarFile) return

		setAvatarLoading(true)
		setAvatarMessage(null)

		try {
			const jwt = localStorage.getItem('jwt')
			if (!jwt) throw new Error('Не авторизован')

			const formData = new FormData()
			formData.append('avatar', avatarFile)

			const response = await fetch('/api/profile/avatar', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
				body: formData,
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Ошибка при загрузке аватара')
			}

			const data = await response.json()
			setAvatarPreview(data.url)
			setAvatarMessage({ type: 'success', text: 'Аватар успешно обновлён' })
			setAvatarFile(null)
		} catch (error) {
			console.error('Failed to upload avatar:', error)
			setAvatarMessage({
				type: 'error',
				text:
					error instanceof Error
						? error.message
						: 'Ошибка при загрузке аватара',
			})
		} finally {
			setAvatarLoading(false)
		}
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Профиль</h1>

			{/* Информация о профиле */}
			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>Профиль пользователя</h2>
				<div className={styles.profileInfo}>
					<div className={styles.avatar}>
						{avatarPreview ? (
							<img
								src={avatarPreview}
								alt="Аватар"
								className={styles.avatarImage}
							/>
						) : (
							<div className={styles.avatarPlaceholder}>
								{avatarLetter}
							</div>
						)}
					</div>
					<div className={styles.userInfo}>
						<div className={styles.userName}>{profile.name}</div>
						<div className={styles.userId}>ID: {profile.userId}</div>
						{profile.isAdmin && (
							<div
								style={{
									color: '#93c5fd',
									fontSize: '12px',
									marginTop: '4px',
								}}
							>
								Администратор
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Редактирование имени */}
			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>Редактирование имени</h2>
				{isEditingName ? (
					<form onSubmit={handleNameSubmit} className={styles.form}>
						<div className={styles.formGroup}>
							<label className={styles.label}>Новое имя</label>
							<input
								className={styles.input}
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Введите новое имя"
								autoFocus
							/>
						</div>
						<div style={{ display: 'flex', gap: '8px' }}>
							<button
								className={styles.button}
								type="submit"
								disabled={
									nameLoading || !name.trim() || name === profile.name
								}
							>
								{nameLoading ? 'Сохранение...' : 'Сохранить'}
							</button>
							<button
								className={`${styles.button} ${styles.buttonDanger}`}
								type="button"
								onClick={() => {
									setName(profile.name)
									setIsEditingName(false)
									setNameMessage(null)
								}}
								disabled={nameLoading}
							>
								Отмена
							</button>
						</div>
					</form>
				) : (
					<div
						style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
					>
						<div style={{ flex: 1 }}>
							<div className={styles.label}>Текущее имя</div>
							<div style={{ fontSize: '16px', marginTop: '4px' }}>
								{profile.name}
							</div>
						</div>
						<button
							className={styles.button}
							onClick={() => setIsEditingName(true)}
						>
							Изменить
						</button>
					</div>
				)}
				{nameMessage && (
					<div
						className={`${styles.message} ${styles[nameMessage.type === 'success' ? 'messageSuccess' : 'messageError']}`}
					>
						{nameMessage.text}
					</div>
				)}
			</div>

			{/* Смена пароля */}
			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>Смена пароля</h2>
				<form onSubmit={handlePasswordSubmit} className={styles.form}>
					<div className={styles.formGroup}>
						<label className={styles.label}>Старый пароль</label>
						<input
							className={styles.input}
							type="password"
							value={oldPassword}
							onChange={(e) => setOldPassword(e.target.value)}
							placeholder="Введите старый пароль"
						/>
					</div>
					<div className={styles.formGroup}>
						<label className={styles.label}>Новый пароль</label>
						<input
							className={styles.input}
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="Введите новый пароль (мин. 6 символов)"
						/>
					</div>
					<div className={styles.formGroup}>
						<label className={styles.label}>Подтверждение пароля</label>
						<input
							className={styles.input}
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Повторите новый пароль"
						/>
					</div>
					<button
						className={styles.button}
						type="submit"
						disabled={
							passwordLoading ||
							!oldPassword ||
							!newPassword ||
							!confirmPassword
						}
					>
						{passwordLoading ? 'Смена пароля...' : 'Сменить пароль'}
					</button>
				</form>
				{passwordMessage && (
					<div
						className={`${styles.message} ${styles[passwordMessage.type === 'success' ? 'messageSuccess' : 'messageError']}`}
					>
						{passwordMessage.text}
					</div>
				)}
			</div>

			{/* Загрузка аватара */}
			<div className={styles.section}>
				<h2 className={styles.sectionTitle}>Аватар</h2>
				<div className={styles.avatarUpload}>
					<div className={styles.avatar}>
						{avatarPreview ? (
							<img
								src={avatarPreview}
								alt="Предпросмотр"
								className={styles.avatarPreview}
							/>
						) : (
							<div className={styles.avatarPlaceholder}>
								{avatarLetter}
							</div>
						)}
					</div>
					<div style={{ flex: 1 }}>
						<input
							type="file"
							id="avatar-upload"
							className={styles.fileInput}
							accept="image/*"
							onChange={handleAvatarSelect}
						/>
						<label htmlFor="avatar-upload">
							<button
								className={`${styles.button} ${styles.uploadButton}`}
								type="button"
								onClick={() =>
									document.getElementById('avatar-upload')?.click()
								}
							>
								Выбрать файл
							</button>
						</label>
						<div
							style={{
								fontSize: '12px',
								color: 'rgba(229, 231, 235, 0.6)',
								marginTop: '4px',
							}}
						>
							Поддерживаются JPG, PNG, GIF, WEBP. Максимум 5MB.
						</div>
					</div>
					{avatarFile && (
						<button
							className={styles.button}
							onClick={handleAvatarUpload}
							disabled={avatarLoading}
						>
							{avatarLoading ? 'Загрузка...' : 'Загрузить'}
						</button>
					)}
				</div>
				{avatarMessage && (
					<div
						className={`${styles.message} ${styles[avatarMessage.type === 'success' ? 'messageSuccess' : 'messageError']}`}
					>
						{avatarMessage.text}
					</div>
				)}
			</div>
		</div>
	)
}
