import type { ReactNode } from 'react'

// Регулярное выражение для поиска URL
// Поддерживает: http://, https://, www.
const URL_REGEX = /(https?:\/\/[^\s<>]+|www\.[^\s<>]+\.[^\s<>]+)/gi

// Функция для экранирования HTML-сущностей
function escapeHtml(text: string): string {
	const div = document.createElement('div')
	div.textContent = text
	return div.innerHTML
}

// Функция для преобразования URL в ссылку
function urlToLink(url: string): string {
	let href = url
	if (!href.startsWith('http://') && !href.startsWith('https://')) {
		href = 'https://' + href
	}
	return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">${escapeHtml(url)}</a>`
}

type LinkifiedTextProps = {
	text: string
}

export default function LinkifiedText({ text }: LinkifiedTextProps) {
	// Разбиваем текст на части: обычный текст и URL
	const parts: ReactNode[] = []
	let lastIndex = 0
	let match: RegExpExecArray | null

	const regex = new RegExp(URL_REGEX.source, 'gi')

	while ((match = regex.exec(text)) !== null) {
		// Добавляем текст до URL
		if (match.index > lastIndex) {
			parts.push(text.substring(lastIndex, match.index))
		}

		// Добавляем URL как ссылку
		const url = match[0]
		let href = url
		if (!href.startsWith('http://') && !href.startsWith('https://')) {
			href = 'https://' + href
		}

		parts.push(
			<a
				key={match.index}
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				style={{
					color: '#60a5fa',
					textDecoration: 'underline',
					wordBreak: 'break-all',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{url}
			</a>
		)

		lastIndex = regex.lastIndex
	}

	// Добавляем оставшийся текст
	if (lastIndex < text.length) {
		parts.push(text.substring(lastIndex))
	}

	// Если не нашли URL, возвращаем обычный текст
	if (parts.length === 0) {
		return <>{text}</>
	}

	return <>{parts}</>
}
