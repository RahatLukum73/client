// Палитра цветов для ников
const NAME_COLORS = [
	'#FF6B6B', // Красный
	'#4ECDC4', // Бирюзовый
	'#45B7D1', // Голубой
	'#96CEB4', // Зелёный
	'#FFEAA7', // Жёлтый
	'#DDA0DD', // Фиолетовый
	'#98D8C8', // Мятный
	'#F7DC6F', // Охра
	'#BB8FCE', // Лаванда
	'#85C1E9', // Небесный
	'#F8B500', // Золотой
	'#FF8C00', // Оранжевый
	'#00CED1', // Тёмный бирюзовый
	'#FF69B4', // Розовый
	'#32CD32', // Лайм
]

/**
 * Генерирует цвет для имени пользователя на основе userId
 * Цвет будет одинаковым для одного пользователя всегда
 */
export function getUsernameColor(userId: string): string {
	let hash = 0
	for (let i = 0; i < userId.length; i++) {
		hash = userId.charCodeAt(i) + ((hash << 5) - hash)
	}

	// Делаем число положительным
	hash = Math.abs(hash)

	// Выбираем индекс из палитры
	const index = hash % NAME_COLORS.length

	return NAME_COLORS[index]
}