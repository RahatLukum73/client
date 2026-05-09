export type ChatAuthor = {
	id: string
	name: string
	isAdmin?: boolean
	avatarUrl?: string
}

export type ChatAttachment = {
	id: string
	url: string
	filename: string
	mimeType: string
	size: number
	width?: number
	height?: number
}

export type ChatMessage = {
	id: string
	author: ChatAuthor
	text: string
	timestamp: string // ISO
	attachments?: ChatAttachment[]
}
