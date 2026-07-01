type Listener = () => void

let onlineUsers = new Set<string>()

const listeners = new Set<Listener>()

function emit() {
	for (const listener of listeners) {
		listener()
	}
}

export const onlineStore = {
	getSnapshot(): ReadonlySet<string> {
		return onlineUsers
	},

	subscribe(listener: Listener): () => void {
		listeners.add(listener)

		return () => {
			listeners.delete(listener)
		}
	},

	setOnlineUsers(userIds: string[]) {
		onlineUsers = new Set(userIds)
		emit()
	},

	markOnline(userId: string) {
		if (onlineUsers.has(userId)) return

		onlineUsers = new Set(onlineUsers)
		onlineUsers.add(userId)

		emit()
	},

	markOffline(userId: string) {
		if (!onlineUsers.has(userId)) return

		onlineUsers = new Set(onlineUsers)
		onlineUsers.delete(userId)

		emit()
	},

	isOnline(userId: string): boolean {
		return onlineUsers.has(userId)
	},

	clear() {
		if (onlineUsers.size === 0) return

		onlineUsers = new Set()
		emit()
	},
}
