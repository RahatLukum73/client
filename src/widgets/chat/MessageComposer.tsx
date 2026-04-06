import { useMemo, useState } from 'react'

export default function MessageComposer(props: {
	disabled: boolean
	onSend: (text: string) => void | Promise<void>
}) {
	const { disabled, onSend } = props
	const [text, setText] = useState('')

	const canSend = useMemo(() => {
		return !disabled && text.trim().length > 0
	}, [disabled, text])

	const handleSend = async () => {
		const value = text.trim()
		if (!value) return
		setText('')
		await onSend(value)
	}

	return (
		<div className="tg-composer">
			<input
				className="tg-input tg-input-composer"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Сообщение..."
				onKeyDown={(e) => {
					if (e.key === 'Enter') void handleSend()
				}}
				disabled={disabled}
			/>
			<button
				className="tg-button tg-button-send"
				disabled={!canSend}
				onClick={() => void handleSend()}
			>
				Отправить
			</button>
		</div>
	)
}
