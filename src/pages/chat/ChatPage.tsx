import { useEffect, useRef } from 'react'
import type { WsJoinRequestToAdmin } from '../../shared/api/wsProtocol'
import type { ChatProfile } from '../../features/auth/model/profile'
import type { ChatMessage } from '../../shared/entities/message/model'
import MessageList from '../../widgets/chat/MessageList'
import MessageComposer from '../../widgets/chat/MessageComposer'
import styles from './ChatPage.module.css'

type SocketStatus = 'disconnected' | 'connecting' | 'connected'

export default function ChatPage(props: {
	profile: ChatProfile
	joined: boolean
	wsStatus: SocketStatus
	messages: ChatMessage[]
	joinRequests: WsJoinRequestToAdmin[]
	onSendMessage: (text: string, attachmentIds?: string[]) => void
	onDeleteMessage: (messageId: string) => void
	onApproveJoinRequest: (userId: string) => void
	onRejectJoinRequest: (userId: string) => void
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
	} = props

	const scrollRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const el = scrollRef.current
		if (!el) return
		el.scrollTop = el.scrollHeight
	}, [messages.length])

	const handleSend = (text: string, attachmentIds?: string[]) => {
		if (!joined) return
		onSendMessage(text, attachmentIds)
	}

	return (
		<div className={styles.chatShell}>
			<div className={styles.messagesWrap} ref={scrollRef}>
				<MessageList
					profile={profile}
					messages={messages}
					isAdmin={profile.isAdmin}
					onDeleteMessage={onDeleteMessage}
				/>
			</div>

			<MessageComposer
				onSendMessage={handleSend}
				disabled={!joined}
				placeholder={joined ? 'Сообщение...' : 'Ожидайте одобрения...'}
			/>
		</div>
	)
}
