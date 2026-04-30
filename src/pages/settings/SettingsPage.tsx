import { useState } from 'react'
import type { WsJoinRequestToAdmin } from '../../shared/api/wsProtocol'
import type { ChatProfile } from '../../features/auth/model/profile'
import type { ChatUser } from '../../shared/api/users'
import AdminPanel from '../../widgets/admin/AdminPanel'
import ConfirmModal from '../../shared/ui/ConfirmModal/ConfirmModal'
import styles from './SettingsPage.module.css'

type ConfirmAction = {
	type: 'kick' | 'clearMessages' | 'clearUsers'
	userId?: string
	userName?: string
} | null

type SettingsPageProps = {
	profile: ChatProfile
	joinRequests: WsJoinRequestToAdmin[]
	isAdmin: boolean
	users: ChatUser[]
	onApproveJoinRequest: (userId: string) => void
	onRejectJoinRequest: (userId: string) => void
	onClearMessages: () => void
	onClearUsers: () => void
	onKickUser: (userId: string) => void
	onLogout: () => void
}

export default function SettingsPage(props: SettingsPageProps) {
	const {
		profile,
		joinRequests,
		isAdmin,
		users,
		onApproveJoinRequest,
		onRejectJoinRequest,
		onClearMessages,
		onClearUsers,
		onKickUser,
		onLogout,
	} = props

	const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

	const openKickConfirm = (userId: string, userName: string) => {
		setConfirmAction({ type: 'kick', userId, userName })
	}

	const openClearMessagesConfirm = () => {
		setConfirmAction({ type: 'clearMessages' })
	}

	const openClearUsersConfirm = () => {
		setConfirmAction({ type: 'clearUsers' })
	}

	const closeConfirm = () => {
		setConfirmAction(null)
	}

	const handleConfirm = () => {
		if (!confirmAction) return

		switch (confirmAction.type) {
			case 'kick':
				if (confirmAction.userId) {
					onKickUser(confirmAction.userId)
				}
				break
			case 'clearMessages':
				onClearMessages()
				break
			case 'clearUsers':
				onClearUsers()
				break
		}
		closeConfirm()
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Настройки</h1>

			{isAdmin && (
				<>
					<div className={styles.adminSection}>
						<h2 className={styles.sectionTitle}>
							Администрирование чата
						</h2>

						<div className={styles.buttonGroup}>
							<button
								className={`${styles.button} ${styles.buttonDanger}`}
								onClick={openClearMessagesConfirm}
							>
								🧹 Удалить все сообщения
							</button>
							<button
								className={`${styles.button} ${styles.buttonDanger}`}
								onClick={openClearUsersConfirm}
							>
								👥 Удалить всех пользователей
							</button>
						</div>

						<div className={styles.adminSection}>
							<h3 className={styles.sectionSubtitle}>
								Заявки на вход ({joinRequests.length})
							</h3>
							{joinRequests.length > 0 ? (
								<AdminPanel
									joinRequests={joinRequests}
									onApprove={onApproveJoinRequest}
									onReject={onRejectJoinRequest}
								/>
							) : (
								<p className={styles.infoText}>Нет новых заявок</p>
							)}
						</div>
					</div>
					<div className={styles.adminSection}>
						<h2 className={styles.sectionSubtitle}>Пользователи</h2>
						<div className={styles.userList}>
							{users.map((u) => (
								<div key={u.id} className={styles.userItem}>
									<div className={styles.userAvatar}>
										{u.avatarUrl ? (
											<img src={u.avatarUrl} alt={u.name} />
										) : (
											u.name[0].toUpperCase()
										)}
									</div>
									<div className={styles.userInfo}>
										<div className={styles.userName}>
											{u.name}
											{u.isAdmin && (
												<span className={styles.adminBadge}>
													👑
												</span>
											)}
										</div>
										<div className={styles.userStatus}>
											{u.status === 'pending'
												? '⏳ Ожидает'
												: '✅ Активен'}
										</div>
									</div>
												{!u.isAdmin && (
													<button
														className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
														onClick={() => openKickConfirm(u.id, u.name)}
														disabled={u.id === profile.userId}
													>
														🗑
													</button>
												)}
								</div>
							))}
						</div>
					</div>
				</>
			)}

			<div className={`${styles.adminSection} ${styles.accountSection}`}>
				<h2 className={styles.sectionTitle}>Аккаунт</h2>
				<button
					className={`${styles.button} ${styles.buttonDanger} ${styles.buttonFullWidth}`}
					onClick={onLogout}
				>
					Выйти из аккаунта
				</button>
			</div>
			<ConfirmModal
				isOpen={confirmAction !== null}
				title={
					confirmAction?.type === 'kick'
						? 'Удалить пользователя'
						: confirmAction?.type === 'clearMessages'
						? 'Удалить все сообщения'
						: confirmAction?.type === 'clearUsers'
						? 'Удалить всех пользователей'
						: ''
				}
				message={
					confirmAction?.type === 'kick'
						? `Вы уверены, что хотите удалить пользователя "${confirmAction.userName}"? Это действие нельзя отменить.`
						: confirmAction?.type === 'clearMessages'
						? 'Вы уверены, что хотите удалить ВСЕ сообщения? Это действие нельзя отменить.'
						: confirmAction?.type === 'clearUsers'
						? 'Вы уверены, что хотите удалить ВСЕХ пользователей? Это действие нельзя отменить.'
						: ''
				}
				confirmText={
					confirmAction?.type === 'kick' ? 'Удалить' : 'Подтвердить'
				}
				confirmVariant="danger"
				onConfirm={handleConfirm}
				onCancel={closeConfirm}
			/>
		</div>
	)
}
