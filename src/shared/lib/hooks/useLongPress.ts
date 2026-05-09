import { useCallback, useRef } from 'react'

type LongPressOptions = {
	onLongPress: () => void
	onClick?: () => void
	delay?: number
}

export function useLongPress(options: LongPressOptions) {
	const { onLongPress, onClick, delay = 600 } = options
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isLongPress = useRef(false)

	const start = useCallback(() => {
		isLongPress.current = false
		timerRef.current = setTimeout(() => {
			isLongPress.current = true
			onLongPress()
		}, delay)
	}, [onLongPress, delay])

	const clear = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const end = useCallback(() => {
		clear()
		// Если это был не long press — вызываем onClick
		if (!isLongPress.current && onClick) {
			onClick()
		}
	}, [clear, onClick])

	// Отменяем если палец сдвинулся
	const move = useCallback(() => {
		clear()
		isLongPress.current = false
	}, [clear])

	return {
		onMouseDown: start,
		onMouseUp: end,
		onMouseLeave: clear,
		onTouchStart: start,
		onTouchEnd: end,
		onTouchMove: move,
		onContextMenu: (e: React.MouseEvent | React.TouchEvent) => {
			// Блокируем стандартное контекстное меню на мобиле
			e.preventDefault()
		},
	}
}