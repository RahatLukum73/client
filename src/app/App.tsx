import { useEffect, useState } from 'react'
import LoginPage from '../pages/login/LoginPage'
import ChatPage from '../pages/chat/ChatPage'
import { useSocket } from '../shared/lib/socket/useSocket'
import type {
	WsServerEvent,
	WsJoinRequestToAdmin,
} from '../shared/api/wsProtocol'
import { subscribeForPush } from '../shared/lib/pwa/push'

type Auth = {
	jwt: string
	userId: string
	isAdmin: boolean
	name: string
}

export default function App() {
	const [auth, setAuth] = useState<Auth | null>(null)
	const [status, setStatus] = useState<'pending' | 'approved' | 'kicked'>(
		'pending'
	)
	const [authError, setAuthError] = useState<string | null>(null)

	const [messages, setMessages] = useState<any[]>([])
	const [pendingUsers, setPendingUsers] = useState<WsJoinRequestToAdmin[]>([])

	const {
		status: wsStatus,
		connect,
		send,
	} = useSocket(import.meta.env.VITE_WS_URL, (msg: WsServerEvent) => {
		// 🔐 AUTH
		if (msg.type === 'login_success' || msg.type === 'register_success') {
			localStorage.setItem('jwt', msg.jwt)

			setAuth({
				jwt: msg.jwt,
				userId: msg.userId,
				isAdmin: msg.isAdmin,
				name: msg.name.trim(),
			})
		}
		if (msg.type === 'auth_error') {
			setAuthError(msg.message)
		}

		if (msg.type === 'login_success' || msg.type === 'register_success') {
			setAuthError(null) // ✅ сброс ошибки

			localStorage.setItem('jwt', msg.jwt)

			setAuth({
				jwt: msg.jwt,
				userId: msg.userId,
				isAdmin: msg.isAdmin,
				name: msg.name.trim(),
			})
		}

		// 📊 STATUS

		if (msg.type === 'join_status') {
			setStatus(msg.status) // <--- обязательно вернуть!
		}

		if (msg.type === 'join_approved') {
			setStatus('approved')

			if ('history' in msg && msg.history) {
				setMessages(msg.history)
			}
		}

		if (msg.type === 'join_rejected') {
			setAuth(null)
			setStatus('pending')
			localStorage.removeItem('jwt')
		}

		// 👮 ADMIN PANEL
		if (msg.type === 'join_request') {
			setPendingUsers((prev) => {
				if (prev.some((u) => u.userId === msg.userId)) return prev
				return [
					...prev,
					{
						type: 'join_request',
						userId: msg.userId,
						name: msg.name.trim(),
					},
				]
			})
		}

		// 💬 CHAT
		if (msg.type === 'message') {
			setMessages((prev) => [...prev, msg.message])
		}
		// DELETE MESSAGE
		if (msg.type === 'delete_message') {
			setMessages((prev) =>
				prev.filter((m) => String(m.id) !== String(msg.messageId))
			)
		}

		// 💬 ADMIN NOTICE
		if (msg.type === 'admin_notice') {
			setMessages([])
		}

		// KICK USER
		if (msg.type === 'join_status') {
			if (msg.status === 'kicked') {
				setAuth(null)
				setStatus('pending')
				localStorage.removeItem('jwt')
			}
		}

		if (msg.type === 'admin_clear_users') {
			setMessages([])
			setPendingUsers([])
			setAuth(null)
			setStatus('pending')
			localStorage.removeItem('jwt')
		}
	})

	// 🔌 connect on mount
	useEffect(() => {
		connect()
	}, [])

	// 🔁 auto resume
	useEffect(() => {
		if (wsStatus !== 'connected') return

		const jwt = localStorage.getItem('jwt')
		if (!jwt) return

		send({ type: 'resume', token: jwt })
	}, [wsStatus])

	useEffect(() => {
		console.log('[App] auth changed, jwt present:', !!auth?.jwt)
		if (!auth?.jwt) return

		console.log('[App] Calling subscribeForPush')
		subscribeForPush(auth.jwt)
	}, [auth])

	// 🔐 LOGIN / REGISTER
	const handleLogin = (name: string, password: string) => {
		send({
			type: 'login_request',
			name,
			password,
		})
	}

	const handleRegister = (name: string, password: string) => {
		send({
			type: 'register_request',
			name,
			password,
		})
	}

	const handleLogout = () => {
		localStorage.removeItem('jwt')
		setAuth(null)
		setStatus('pending')
		setMessages([])
		setPendingUsers([])
	}

	// ⛔ LOGIN PAGE
	if (!auth) {
		return (
			<LoginPage
				wsStatus={wsStatus}
				onLogin={handleLogin}
				onRegister={handleRegister}
				error={authError ?? undefined}
			/>
		)
	}

	// ⏳ WAIT APPROVAL
	if (status === 'pending') {
		return <div>Ожидание одобрения админа...</div>
	}

	// ✅ CHAT PAGE
	return (
		<ChatPage
			profile={{
				userId: auth.userId,
				name: auth.name,
				isAdmin: auth.isAdmin,
				sessionToken: auth.jwt,
			}}
			joined={status === 'approved'}
			wsStatus={wsStatus}
			messages={messages}
			joinRequests={pendingUsers}
			onLogout={handleLogout}
			onSendMessage={(text) => {
				send({
					type: 'send_message',
					messageId: crypto.randomUUID(),
					text,
				})
			}}
			onDeleteMessage={(id) => {
				send({ type: 'delete_message', messageId: id })
			}}
			onApproveJoinRequest={(userId) => {
				send({ type: 'join_approve', userId })
				setPendingUsers((prev) => prev.filter((u) => u.userId !== userId))
			}}
			onRejectJoinRequest={(userId) => {
				send({ type: 'join_reject', userId })
				setPendingUsers((prev) => prev.filter((u) => u.userId !== userId))
			}}
			onKickUser={(userId) => {
				send({ type: 'kick_user', userId })
			}}
			onClearMessages={() => {
				send({ type: 'admin_clear_messages' })
			}}
			onClearUsers={() => {
				send({ type: 'admin_clear_users' })
			}}
		/>
	)
}
