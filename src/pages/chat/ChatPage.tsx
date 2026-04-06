import { useEffect, useRef, useState } from 'react'
import type { WsJoinRequestToAdmin } from '../../shared/api/wsProtocol'
import type { ChatProfile } from '../../features/auth/model/profile'
import MessageComposer from '../../widgets/chat/MessageComposer'
import MessageList from '../../widgets/chat/MessageList'
import AdminPanel from '../../widgets/admin/AdminPanel'

type SocketStatus = 'disconnected' | 'connecting' | 'connected'

export default function ChatPage(props: {
	profile: ChatProfile
	joined: boolean
	wsStatus: SocketStatus
	messages: any[]
	joinRequests: WsJoinRequestToAdmin[]
	onSendMessage: (text: string) => void
	onDeleteMessage: (messageId: string) => void
	onApproveJoinRequest: (userId: string) => void
	onRejectJoinRequest: (userId: string) => void
	onKickUser: (userId: string) => void
	onLogout: () => void
	onClearMessages?: () => void
	onClearUsers?: () => void
}) {
	const {
		profile,
		joined,
		wsStatus,
		messages,
		joinRequests,
		onSendMessage,
		onDeleteMessage,
		onApproveJoinRequest,
		onRejectJoinRequest,
		onKickUser,
		onLogout,
		onClearMessages,
		onClearUsers,
	} = props
	const [showAdmin, setShowAdmin] = useState(false)

	const scrollRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const el = scrollRef.current
		if (!el) return
		el.scrollTop = el.scrollHeight
	}, [messages.length])
	
	const hasRequests = joinRequests.length > 0

	return (
		<div className="tg-shell tg-chat-shell">
			<div className="tg-header">
				<div className="tg-header-left">
					<div className="tg-avatar tg-avatar-big">
						{profile.name.slice(0, 1).toUpperCase()}
					</div>
					<div className="tg-header-title">
						{profile.name}
						{profile.isAdmin && <span className="tg-badge">admin</span>}
					</div>
				</div>

				<div className="tg-header-right">
					<div className="tg-header-top">
					<button
						className="tg-button tg-button-small"
						onClick={onLogout}
					>
						Выйти
					</button>
					<div className="tg-text tg-text-muted">
						{wsStatus === 'connected'
							? 'online'
							: wsStatus === 'connecting'
								? 'connecting...'
								: 'offline'}
					</div>
					</div>

					{joined && profile.isAdmin && (
						<div className="tg-header-button">
							<button onClick={() => setShowAdmin((prev) => !prev)}>
								⚙️
							</button>
							{hasRequests && <span className="tg-badge-dot" />}
							<button onClick={() => onClearMessages?.()}>
								🧹
							</button>
							<button onClick={() => onClearUsers?.()}>👥</button>
						</div>
					)}
				</div>
			</div>

			{showAdmin && (
				<>
					<div
						className="tg-overlay"
						onClick={() => setShowAdmin(false)}
					/>

					<div className="tg-admin-drawer">
						<div className="tg-admin-close">
							<button onClick={() => setShowAdmin(false)}>✖</button>
						</div>
						{!joined ? (
							<div className="tg-admin-section">
								<div className="tg-admin-title">
									Ожидает подтверждения
								</div>
								<div className="tg-text tg-text-muted">
									Администратор принимает заявку на вход...
								</div>
							</div>
						) : null}

						{joined && profile.isAdmin ? (
							<AdminPanel
								joinRequests={joinRequests}
								onApprove={onApproveJoinRequest}
								onReject={onRejectJoinRequest}
							/>
						) : null}
					</div>
				</>
			)}

			<div className="tg-messages-wrap" ref={scrollRef}>
				<MessageList
					profile={profile}
					messages={messages}
					isAdmin={profile.isAdmin}
					onDeleteMessage={onDeleteMessage}
					onKickUser={onKickUser}
				/>
			</div>

			<MessageComposer disabled={!joined} onSend={onSendMessage} />
		</div>
	)
}
