import { useEffect, useState } from 'react'
import { HashRouter , Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/login/LoginPage'
import ChatPage from '../pages/chat/ChatPage'
import ProfilePage from '../pages/profile/ProfilePage'
import SettingsPage from '../pages/settings/SettingsPage'
import Layout from '../widgets/layout/Layout'
import { fetchUsers, type ChatUser } from '../shared/api/users'
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
	avatarUrl?: string
}

// Компонент для защиты маршрутов
function ProtectedRouteWrapper(props: {
	auth: Auth
	status: 'unknown' | 'pending' | 'approved' | 'kicked'
	wsStatus: 'disconnected' | 'connecting' | 'connected'
	isRestoring: boolean
	messages: any[]
	users: ChatUser[]
	pendingUsers: WsJoinRequestToAdmin[]
	onSendMessage: (text: string, attachmentIds?: string[]) => void
	onDeleteMessage: (messageId: string) => void
	onApproveJoinRequest: (userId: string) => void
	onRejectJoinRequest: (userId: string) => void
	onKickUser: (userId: string) => void
	onClearMessages: () => void
	onClearUsers: () => void
	onLogout: () => void
	onProfileUpdate: (updates: Partial<Auth>) => void
}) {
	const {
		auth,
		status,
		isRestoring,
		wsStatus,
		messages,
		users,
		pendingUsers,
		onSendMessage,
		onDeleteMessage,
		onApproveJoinRequest,
		onRejectJoinRequest,
		onKickUser,
		onClearMessages,
		onClearUsers,
		onLogout,
		onProfileUpdate,
	} = props

	if (status === 'unknown') {
		return null
	}
	// Если статус "pending", показываем ожидание
	if (status === 'pending' && !isRestoring) {
		return <div>Ожидание одобрения админа...</div>
	}
	// Если статус "kicked", перенаправляем на логин
	if (status === 'kicked') {
		return <Navigate to="/login" replace />
	}

	// Для одобренных пользователей показываем Layout с маршрутами
	return (
		<Layout
			profile={{
				userId: auth.userId,
				name: auth.name,
				isAdmin: auth.isAdmin,
				sessionToken: auth.jwt,
				avatarUrl: auth.avatarUrl,
			}}
			wsStatus={wsStatus}
			joinRequestsCount={pendingUsers.length}
		>
			<Routes>
				<Route
					path="/chat"
					element={
						<ChatPage
							profile={{
								userId: auth.userId,
								name: auth.name,
								isAdmin: auth.isAdmin,
								sessionToken: auth.jwt,
								avatarUrl: auth.avatarUrl,
							}}
							joined={status === 'approved'}
							wsStatus={wsStatus}
							messages={messages}
							joinRequests={pendingUsers}
							onSendMessage={onSendMessage}
							onDeleteMessage={onDeleteMessage}
							onApproveJoinRequest={onApproveJoinRequest}
							onRejectJoinRequest={onRejectJoinRequest}
						/>
					}
				/>
				<Route
					path="/profile"
					element={
						<ProfilePage
							profile={{
								userId: auth.userId,
								name: auth.name,
								isAdmin: auth.isAdmin,
								sessionToken: auth.jwt,
								avatarUrl: auth.avatarUrl,
							}}
							onProfileUpdate={onProfileUpdate}
						/>
					}
				/>
				<Route
					path="/settings"
					element={
						<SettingsPage
							profile={{
								userId: auth.userId,
								name: auth.name,
								isAdmin: auth.isAdmin,
								sessionToken: auth.jwt,
								avatarUrl: auth.avatarUrl,
							}}
							users={users}
							onKickUser={onKickUser}
							joinRequests={pendingUsers}
							isAdmin={auth.isAdmin}
							onApproveJoinRequest={onApproveJoinRequest}
							onRejectJoinRequest={onRejectJoinRequest}
							onClearMessages={onClearMessages}
							onClearUsers={onClearUsers}
							onLogout={onLogout}
						/>
					}
				/>
				<Route path="*" element={<Navigate to="/chat" replace />} />
			</Routes>
		</Layout>
	)
}

export default function App() {
	const [auth, setAuth] = useState<Auth | null>(() => {
		const saved = localStorage.getItem('auth')

		if (!saved) return null

		try {
			return JSON.parse(saved)
		} catch {
			return null
		}
	})
	const [status, setStatus] = useState<
		'unknown' | 'pending' | 'approved' | 'kicked'
	>(() => {
		const saved = localStorage.getItem('chat-status')

		if (
			saved === 'approved' ||
			saved === 'pending' ||
			saved === 'kicked' ||
			saved === 'unknown'
		) {
			return saved
		}

		return 'pending'
	})
	const [authError, setAuthError] = useState<string | null>(null)
	const [isRestoring, setIsRestoring] = useState(false)

	const [messages, setMessages] = useState<any[]>(() => {
		const saved = localStorage.getItem('messages')

		if (!saved) return []

		try {
			return JSON.parse(saved)
		} catch {
			return []
		}
	})
	const [pendingUsers, setPendingUsers] = useState<WsJoinRequestToAdmin[]>([])
	const [users, setUsers] = useState<ChatUser[]>([])

	const {
		status: wsStatus,
		connect,
		send,
		disconnect,
	} = useSocket(import.meta.env.VITE_WS_URL, (msg: WsServerEvent) => {
		// 🔐 AUTH
		if (msg.type === 'login_success' || msg.type === 'register_success') {
			setIsRestoring(false)
			setAuthError(null)
			const authData = {
				jwt: msg.jwt,
				userId: msg.userId,
				isAdmin: msg.isAdmin,
				name: msg.name.trim(),
				avatarUrl: msg.avatarUrl,
			}

			localStorage.setItem('jwt', msg.jwt)
			localStorage.setItem('auth', JSON.stringify(authData))

			setAuth(authData)
		}
		if (msg.type === 'auth_error') {
			setIsRestoring(false)
			setAuthError(msg.message)
		}

		// 📊 STATUS

		if (msg.type === 'join_status') {
			setStatus(msg.status)
		}

		if (msg.type === 'join_approved') {
			setStatus('approved')

			if ('history' in msg && msg.history) {
				setMessages(msg.history)
			}
		}

		if (msg.type === 'join_rejected') {
			setIsRestoring(false)
			setAuth(null)
			setStatus('pending')
			localStorage.removeItem('jwt')
			localStorage.removeItem('auth')
			localStorage.removeItem('messages')
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
			reloadUsers()
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
				localStorage.removeItem('auth')
				localStorage.removeItem('messages')
			}
		}

		if (msg.type === 'admin_clear_users') {
			setMessages([])
			setPendingUsers([])
			setAuth(null)
			setStatus('pending')
			localStorage.removeItem('jwt')
			localStorage.removeItem('auth')
			localStorage.removeItem('messages')
		}
	})

	// 🔌 connect on mount
	useEffect(() => {
		connect()
		const jwt = localStorage.getItem('jwt')
		if (jwt) {
			setIsRestoring(true)
		}
	}, [])

	// ⏱ Таймаут восстановления сессии
	useEffect(() => {
		if (!isRestoring) return

		const timer = setTimeout(() => {
			setIsRestoring(false)
		}, 5000)

		return () => clearTimeout(timer)
	}, [isRestoring])

	// 🔁 auto resume
	useEffect(() => {
		if (wsStatus !== 'connected') return

		const jwt = localStorage.getItem('jwt')
		if (!jwt) return

		send({ type: 'resume', token: jwt })
	}, [wsStatus])

	useEffect(() => {
		if (!auth?.jwt) return
		fetchUsers(auth.jwt)
			.then(setUsers)
			.catch(() => {})
	}, [auth])

	useEffect(() => {
		if (!auth?.jwt) return

		subscribeForPush(auth.jwt)
	}, [auth])

	useEffect(() => {
		localStorage.setItem('messages', JSON.stringify(messages))
	}, [messages])

	useEffect(() => {
		localStorage.setItem('chat-status', status)
	}, [status])

	const reloadUsers = () => {
		const jwt = localStorage.getItem('jwt')
		if (!jwt) return
		fetchUsers(jwt)
			.then(setUsers)
			.catch(() => {})
	}

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
		disconnect()
		localStorage.removeItem('jwt')
		localStorage.removeItem('auth')
		localStorage.removeItem('messages')
		setAuth(null)
		setStatus('pending')
		setMessages([])
		setPendingUsers([])
	}

	return (
		<HashRouter >
			<Routes>
				{/* Маршрут для логина */}
				<Route
					path="/login"
					element={
						!auth ? (
							<LoginPage
								wsStatus={wsStatus}
								onLogin={handleLogin}
								onRegister={handleRegister}
								error={authError ?? undefined}
							/>
						) : (
							<Navigate to="/chat" replace />
						)
					}
				/>

				{/* Защищённые маршруты */}
				<Route
					path="/*"
					element={
						isRestoring ? (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									height: '100vh',
									background: 'rgba(11, 18, 32, 0.85)',
									color: '#e5e7eb',
								}}
							>
								Загрузка...
							</div>
						) : auth ? (
							<ProtectedRouteWrapper
								auth={auth}
								status={status}
								wsStatus={wsStatus}
								isRestoring={isRestoring}
								messages={messages}
								users={users}
								pendingUsers={pendingUsers}
								onSendMessage={(text, attachmentIds) => {
									send({
										type: 'send_message',
										messageId: crypto.randomUUID(),
										text,
										attachmentIds,
									})
								}}
								onDeleteMessage={(id) => {
									send({ type: 'delete_message', messageId: id })
								}}
								onApproveJoinRequest={(userId) => {
									send({ type: 'join_approve', userId })
									setPendingUsers((prev) =>
										prev.filter((u) => u.userId !== userId)
									)
									reloadUsers()
								}}
								onRejectJoinRequest={(userId) => {
									send({ type: 'join_reject', userId })
									setPendingUsers((prev) =>
										prev.filter((u) => u.userId !== userId)
									)
									reloadUsers()
								}}
								onKickUser={(userId) => {
									send({ type: 'kick_user', userId })
									reloadUsers()
								}}
								onClearMessages={() => {
									send({ type: 'admin_clear_messages' })
								}}
								onClearUsers={() => {
									send({ type: 'admin_clear_users' })
								}}
								onLogout={handleLogout}
								onProfileUpdate={(updates) => {
									setAuth((prev) =>
										prev ? { ...prev, ...updates } : prev
									)
								}}
							/>
						) : (
							<Route
								path="/"
								element={
									auth ? (
										<Navigate to="/chat" replace />
									) : (
										<Navigate to="/login" replace />
									)
								}
							/>
						)
					}
				/>

				{/* Корневой маршрут перенаправляет на /login */}
				<Route path="/" element={<Navigate to="/login" replace />} />
			</Routes>
		</HashRouter>
	)
}
