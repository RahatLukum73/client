import type { WsJoinRequestToAdmin } from '../../shared/api/wsProtocol'
import type { ChatProfile } from '../../features/auth/model/profile'
import AdminPanel from '../../widgets/admin/AdminPanel'
import styles from './SettingsPage.module.css'

type SettingsPageProps = {
	profile: ChatProfile
	joinRequests: WsJoinRequestToAdmin[]
	isAdmin: boolean
	onApproveJoinRequest: (userId: string) => void
	onRejectJoinRequest: (userId: string) => void
	onClearMessages: () => void
	onClearUsers: () => void
	onLogout: () => void
}

export default function SettingsPage(props: SettingsPageProps) {
	const {
		profile,
		joinRequests,
		isAdmin,
		onApproveJoinRequest,
		onRejectJoinRequest,
		onClearMessages,
		onClearUsers,
		onLogout,
	} = props

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Настройки</h1>

			{isAdmin ? (
				<>
					<div className={styles.adminSection}>
						<h2 className={styles.sectionTitle}>
							Администрирование чата
						</h2>

						<div className={styles.buttonGroup}>
							<button
								className={`${styles.button} ${styles.buttonDanger}`}
								onClick={onClearMessages}
							>
								🧹 Удалить все сообщения
							</button>
							<button
								className={`${styles.button} ${styles.buttonDanger}`}
								onClick={onClearUsers}
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

						<div className={styles.adminSection}>
							<h2 className={styles.sectionTitle}>
								Настройки уведомлений
							</h2>
							<div className={styles.settingItem}>
								<div>
									<div className={styles.settingLabel}>
										Push-уведомления
									</div>
									<div className={styles.settingDescription}>
										Получать уведомления о новых сообщениях
									</div>
								</div>
								<label className={styles.toggleSwitch}>
									<input
										type="checkbox"
										className={styles.toggleInput}
										defaultChecked
									/>
									<span className={styles.toggleSlider}></span>
								</label>
							</div>
							<div className={styles.settingItem}>
								<div>
									<div className={styles.settingLabel}>
										Звуковые уведомления
									</div>
									<div className={styles.settingDescription}>
										Воспроизводить звук при новом сообщении
									</div>
								</div>
								<label className={styles.toggleSwitch}>
									<input
										type="checkbox"
										className={styles.toggleInput}
										defaultChecked
									/>
									<span className={styles.toggleSlider}></span>
								</label>
							</div>
						</div>
					</div>
				</>
			) : (
				<div className={styles.adminSection}>
					<p className={styles.infoText}>
						Настройки доступны только администраторам.
					</p>
					<p className={styles.infoText}>
						Обычным пользователям доступны только базовые настройки
						профиля.
					</p>
				</div>
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
		</div>
	)
}
