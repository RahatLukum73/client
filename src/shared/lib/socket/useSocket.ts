import { useEffect, useMemo, useState } from 'react'
import type { WsClientMessage, WsServerEvent } from '../../api/wsProtocol'
import {
	idbAddToOutbox,
	idbClearOutbox,
	idbGetOutbox,
	idbRemoveFromOutbox,
} from '../idb/chatDb'

type SocketStatus = 'disconnected' | 'connecting' | 'connected'

type ServerEventHandler = (event: WsServerEvent) => void | Promise<void>

let singleton: {
	ws: WebSocket | null
	url: string | null
	status: SocketStatus
	listeners: Set<ServerEventHandler>
	pendingClientMessages: WsClientMessage[]
} = {
	ws: null,
	url: null,
	status: 'disconnected',
	listeners: new Set(),
	pendingClientMessages: [],
}

let reconnectAttempts = 0
let reconnectTimer: number | null = null
const MAX_RECONNECT_ATTEMPTS = 12

function setStatus(next: SocketStatus) {
	singleton.status = next
}

function emit(event: WsServerEvent) {
	for (const l of singleton.listeners) l(event)
}

function connectWs(url: string) {
	if (singleton.ws) {
		if (
			singleton.ws.readyState === WebSocket.OPEN ||
			singleton.ws.readyState === WebSocket.CONNECTING
		) {
			return
		}
	}

	singleton.url = url
	setStatus('connecting')

	if (reconnectTimer) {
		window.clearTimeout(reconnectTimer)
		reconnectTimer = null
	}
	reconnectAttempts = 0

	const ws = new WebSocket(url)
	singleton.ws = ws

	ws.onopen = () => {
		setStatus('connected')
		const pending = singleton.pendingClientMessages
		singleton.pendingClientMessages = []
		for (const msg of pending) {
			try {
				ws.send(JSON.stringify(msg))
			} catch {
				// Re-queue on failure.
				singleton.pendingClientMessages.push(msg)
			}
		}
	}

	ws.onclose = () => {
		setStatus('disconnected')
		if (reconnectTimer) return
		if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return

		const delay = Math.min(30000, 600 * 2 ** reconnectAttempts)
		reconnectTimer = window.setTimeout(() => {
			reconnectTimer = null
			reconnectAttempts += 1
			if (singleton.url) connectWs(singleton.url)
		}, delay)
	}

	ws.onerror = () => {
		setStatus('disconnected')
		if (reconnectTimer) return
		if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return

		const delay = Math.min(30000, 600 * 2 ** reconnectAttempts)
		reconnectTimer = window.setTimeout(() => {
			reconnectTimer = null
			reconnectAttempts += 1
			if (singleton.url) connectWs(singleton.url)
		}, delay)
	}

	ws.onmessage = (ev) => {
		const raw = ev.data
		if (typeof raw !== 'string') return
		try {
			const msg = JSON.parse(raw) as WsServerEvent
			emit(msg)
		} catch {
			// ignore
		}
	}
}

async function flushOutboxInternal() {
	if (!singleton.ws || singleton.ws.readyState !== WebSocket.OPEN) return
	const items = await idbGetOutbox()
	if (items.length === 0) return

	for (const item of items) {
		const payload: WsClientMessage = {
			type: 'send_message',
			messageId: item.messageId,
			text: item.text,
		}
		try {
			singleton.ws.send(JSON.stringify(payload))
			await idbRemoveFromOutbox(item.messageId)
		} catch {
			// Keep the item for later.
		}
	}
}

export function useSocket(url: string, onEvent?: ServerEventHandler) {
	const [status, setLocalStatus] = useState<SocketStatus>(singleton.status)

	const stableOnEvent = useMemo(() => onEvent, [onEvent])

	useEffect(() => {
		if (!stableOnEvent) return
		singleton.listeners.add(stableOnEvent)
		return () => {
			singleton.listeners.delete(stableOnEvent)
		}
	}, [stableOnEvent])

	useEffect(() => {
		let timer: number | null = null
		const tick = () => setLocalStatus(singleton.status)
		timer = window.setInterval(tick, 500)
		tick()
		return () => {
			if (timer) window.clearInterval(timer)
		}
	}, [])

	const connect = () => connectWs(url)

	const send = async (message: WsClientMessage): Promise<void> => {
		if (singleton.ws && singleton.ws.readyState === WebSocket.OPEN) {
			singleton.ws.send(JSON.stringify(message))
			return
		}

		if (message.type === 'send_message') {
			await idbAddToOutbox({
				messageId: message.messageId,
				text: message.text,
				createdAt: new Date().toISOString(),
			})
			// keep socket queue; will flush on reconnect
			return
		}

		// For non-message types we keep a lightweight in-memory queue.
		singleton.pendingClientMessages.push(message)
	}

	const flushOutbox = async (): Promise<void> => {
		await flushOutboxInternal()
		await idbClearOutbox()
	}

	return { status, connect, send, flushOutbox }
}
