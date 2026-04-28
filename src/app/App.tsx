import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/login/LoginPage'
import ChatPage from '../pages/chat/ChatPage'
import ProfilePage from '../pages/profile/ProfilePage'
import SettingsPage from '../pages/settings/SettingsPage'
import Layout from '../widgets/layout/Layout'
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

// Компонент для защиты маршрутов
function ProtectedRouteWrapper(props: {
	auth: Auth
	status: 'pending' | 'approved' | 'kicked'
	wsStatus: 'disconnected' | 'connecting' | 'connected'
	messages: any[]
	pendingUsers: WsJoinRequestToAdmin[]
	onSendMessage: (text: string, attachmentIds?: string[]) => void
	onDeleteMessage: (messageId: string) => void
	onApproveJoinRequest: (userId: string) => void
	onRejectJoinRequest: (userId: string) => void
	onKickUser: (userId: string) => void
	onClearMessages: () => void
	onClearUsers: () => void
	onLogout: () => void
}) {
	const {
		auth,
		status,
		wsStatus,
		messages,
		pendingUsers,
		onSendMessage,
		onDeleteMessage,
		onApproveJoinRequest,
		onRejectJoinRequest,
		onKickUser,
		onClearMessages,
		onClearUsers,
		onLogout,
	} = props

	// Если статус "pending", показываем ожидание
	if (status === 'pending') {
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
							}}
							joined={status === 'approved'}
							wsStatus={wsStatus}
							messages={messages}
							joinRequests={pendingUsers}
							onSendMessage={onSendMessage}
							onDeleteMessage={onDeleteMessage}
							onApproveJoinRequest={onApproveJoinRequest}
							onRejectJoinRequest={onRejectJoinRequest}
							onKickUser={onKickUser}
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
							}}
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
							}}
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
		disconnect,
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
			setStatus(msg.status)
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
		disconnect()
		localStorage.removeItem('jwt')
		setAuth(null)
		setStatus('pending')
		setMessages([])
		setPendingUsers([])
	}

	return (
		<BrowserRouter>
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
						auth ? (
							<ProtectedRouteWrapper
								auth={auth}
								status={status}
								wsStatus={wsStatus}
								messages={messages}
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
								}}
								onRejectJoinRequest={(userId) => {
									send({ type: 'join_reject', userId })
									setPendingUsers((prev) =>
										prev.filter((u) => u.userId !== userId)
									)
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
								onLogout={handleLogout}
							/>
						) : (
							<Navigate to="/login" replace />
						)
					}
				/>

				{/* Корневой маршрут перенаправляет на /login */}
				<Route path="/" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	)
}
