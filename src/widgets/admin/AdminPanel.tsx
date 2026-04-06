import type { WsJoinRequestToAdmin } from '../../shared/api/wsProtocol'

export default function AdminPanel(props: {
	joinRequests: WsJoinRequestToAdmin[]
	onApprove: (userId: string) => void
	onReject: (userId: string) => void
}) {
	const { joinRequests, onApprove, onReject } = props

	return (
		<div className="tg-admin">
			<div className="tg-admin-section">
				<div className="tg-admin-title">Вход в чат</div>
				{joinRequests.length === 0 ? (
					<div className="tg-text tg-text-muted">Нет ожидающих заявок</div>
				) : null}
				{joinRequests.map((r) => (
					<div key={r.userId} className="tg-admin-request">
						<div className="tg-text">{r.name}</div>
						<div className="tg-admin-actions">
							<button
								className="tg-button tg-button-small"
								onClick={() => onApprove(r.userId)}
							>
								✅
							</button>
							<button
								className="tg-button tg-button-small tg-button-danger"
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
