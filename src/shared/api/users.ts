export type ChatUser = {
	id: string
	name: string
	isAdmin: boolean
	avatarUrl?: string
	status: string
}

export async function fetchUsers(jwt: string): Promise<ChatUser[]> {
	const API_URL = import.meta.env.VITE_WS_URL.replace(
		'wss://',
		'https://'
	).replace('ws://', 'http://')

	const res = await fetch(`${API_URL}/api/users`, {
		headers: { Authorization: `Bearer ${jwt}` },
	})

	if (!res.ok) throw new Error('Failed to fetch users')
	return res.json()
}