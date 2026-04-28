// ================= CLIENT =================

export type WsClientRegister = {
	type: 'register_request'
	name: string
	password: string
}

export type WsClientLogin = {
	type: 'login_request'
	name: string
	password: string
}

export type WsClientResume = {
	type: 'resume'
	token: string
}

export type WsClientJoinApprove = {
	type: 'join_approve'
	userId: string
}

export type WsClientJoinReject = {
	type: 'join_reject'
	userId: string
}

export type WsClientSendMessage = {
	type: 'send_message'
	messageId: string
	text: string
	attachmentIds?: string[]
}

export type WsClientDeleteMessage = {
	type: 'delete_message'
	messageId: string
}

export type WsClientKickUser = {
	type: 'kick_user'
	userId: string
}

export type WsClientAdminClearMessages = {
	type: 'admin_clear_messages'
}

export type WsClientAdminClearUsers = {
	type: 'admin_clear_users'
}

export type WsClientMessage =
	| WsClientRegister
	| WsClientLogin
	| WsClientResume
	| WsClientJoinApprove
	| WsClientJoinReject
	| WsClientSendMessage
	| WsClientDeleteMessage
	| WsClientKickUser
	| WsClientAdminClearMessages
	| WsClientAdminClearUsers

// ================= SERVER =================

export type WsAttachment = {
	id: string
	url: string
	filename: string
	mimeType: string
	size: number
	width?: number
	height?: number
}

export type WsHistoryItem = {
	id: string
	author: { id: string; name: string; isAdmin?: boolean }
	text: string
	timestamp: string
	attachments?: WsAttachment[]
}

// 🔐 AUTH
export type WsRegisterSuccess = {
	type: 'register_success'
	jwt: string
	userId: string
	isAdmin: boolean
	name: string
}

export type WsLoginSuccess = {
	type: 'login_success'
	jwt: string
	userId: string
	isAdmin: boolean
	name: string
}

export type WsAuthError = {
	type: 'auth_error'
	message: string
}

// 👑 ADMIN
export type WsJoinRequestToAdmin = {
	type: 'join_request'
	userId: string
	name: string
}

export type WsJoinApproved = {
	type: 'join_approved'
	userId: string
	isAdmin: boolean
	history?: WsHistoryItem[]
}

export type WsJoinRejected = {
	type: 'join_rejected'
	userId: string
}
export type WsJoinStatus = {
	type: 'join_status'
	status: 'pending' | 'approved' | 'kicked'
}

// 💬 CHAT
export type WsMessageEvent = {
	type: 'message'
	message: WsHistoryItem
}

export type WsMessageAck = {
	type: 'message_ack'
	message: WsHistoryItem
}

export type WsDeleteMessage = {
	type: 'delete_message'
	messageId: string
}

// ⚠️ ERROR
export type WsErrorEvent = {
	type: 'error'
	message: string
}

export type WsAdminNotice = {
	type: 'admin_notice'
	text: string
}

export type WsAdminClearUsers = {
	type: 'admin_clear_users'
}

// ================= UNION =================

export type WsServerEvent =
	| WsRegisterSuccess
	| WsLoginSuccess
	| WsAuthError
	| WsJoinRequestToAdmin
	| WsJoinApproved
	| WsJoinRejected
	| WsJoinStatus
	| WsMessageEvent
	| WsMessageAck
	| WsDeleteMessage
	| WsErrorEvent
	| WsAdminNotice
	| WsAdminClearUsers
