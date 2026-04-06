import type { ChatMessage } from '../../shared/entities/message/model'
import type { ChatProfile } from '../../features/auth/model/profile'

export default function MessageList(props: {
	profile: ChatProfile
	messages: ChatMessage[]
	isAdmin: boolean
	onDeleteMessage: (messageId: string) => void
	onKickUser: (userId: string) => void
}) {
	const { profile, messages, isAdmin, onDeleteMessage, onKickUser } = props

	return (
		<div className="tg-messages" role="log" aria-live="polite">
			{messages.map((m) => {
				const isSelf = m.author.id === profile.userId
				const avatarLetter = (m.author.name?.[0] ?? '?').toUpperCase()
				const showKick = isAdmin && m.author.id !== profile.userId

				return (
					<div
						key={m.id}
						className={isSelf ? 'tg-row tg-row-self' : 'tg-row'}
					>
						{!isSelf ? (
							<div className="tg-avatar" aria-hidden="true">
								{avatarLetter}
							</div>
						) : null}

						<div
							className={
								isSelf ? 'tg-bubble tg-bubble-self' : 'tg-bubble'
							}
						>
							<div className="tg-bubble-meta">
								<span className="tg-author">{m.author.name}</span>
								{isAdmin ? (
									<span className="tg-bubble-actions">
										{showKick ? (
											<button
												className="tg-link"
												onClick={() => onKickUser(m.author.id)}
												type="button"
											>
												Кик
											</button>
										) : null}
										{m.author.id ? (
											<button
												className="tg-link"
												onClick={() => onDeleteMessage(m.id)}
												type="button"
											>
												Удалить
											</button>
										) : null}
									</span>
								) : null}
							</div>
							<div className="tg-text">{m.text}</div>
						</div>

						{isSelf ? (
							<div className="tg-avatar" aria-hidden="true">
								{avatarLetter}
							</div>
						) : null}
					</div>
				)
			})}
		</div>
	)
}
