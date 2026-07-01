import { useSyncExternalStore } from 'react'
import { onlineStore } from './onlineStore'

export function useOnlineUsers() {
	return useSyncExternalStore(
		onlineStore.subscribe,
		onlineStore.getSnapshot,
		onlineStore.getSnapshot
	)
}
