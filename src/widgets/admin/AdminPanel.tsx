import type { WsJoinRequestToAdmin } from '../../shared/api/wsProtocol'
import styles from './AdminPanel.module.css'

export default function AdminPanel(props: {
	joinRequests: WsJoinRequestToAdmin[]
	onApprove: (userId: string) => void
	onReject: (userId: string) => void
}) {
	const { joinRequests, onApprove, onReject } = props

	return (
		<div className={styles.admin}>
			<div className={styles.adminSection}>
				<div className={styles.adminTitle}>Вход в чат</div>
				{joinRequests.length === 0 ? (
					<div className={`${styles.text} ${styles.textMuted}`}>
						Нет ожидающих заявок
					</div>
				) : null}
				{joinRequests.map((r) => (
					<div key={r.userId} className={styles.adminRequest}>
						<div className={styles.text}>{r.name}</div>
						<div className={styles.adminActions}>
							<button
								className={`${styles.button} ${styles.buttonSmall}`}
								onClick={() => onApprove(r.userId)}
							>
								✅
							</button>
							<button
								className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
								onClick={() => onReject(r.userId)}
							>
								❌
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
