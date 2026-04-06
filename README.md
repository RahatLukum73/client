# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			// Other configs...

			// Remove tseslint.configs.recommended and replace with this
			tseslint.configs.recommendedTypeChecked,
			// Alternatively, use this for stricter rules
			tseslint.configs.strictTypeChecked,
			// Optionally, add this for stylistic rules
			tseslint.configs.stylisticTypeChecked,

			// Other configs...
		],
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.node.json', './tsconfig.app.json'],
				tsconfigRootDir: import.meta.dirname,
			},
			// other options...
		},
	},
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			// Other configs...
			// Enable lint rules for React
			reactX.configs['recommended-typescript'],
			// Enable lint rules for React DOM
			reactDom.configs.recommended,
		],
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.node.json', './tsconfig.app.json'],
				tsconfigRootDir: import.meta.dirname,
			},
			// other options...
		},
	},
])
```

# 🧩 Xutor Chat

> 🚧 Проект находится в активной разработке

Realtime чат-приложение с авторизацией, админ-панелью и PWA поддержкой.

---

## 👤 Автор

**<Владимир Посеряев>**
© 2026

---

## 🚀 Возможности

- 🔐 Регистрация и авторизация (JWT)
- 💬 Реалтайм чат (WebSocket)
- 👑 Админ-панель:
   - подтверждение пользователей
   - удаление сообщений
   - кик пользователей

- 📜 История сообщений (PostgreSQL)
- 📱 PWA (установка как приложение на телефон)
- 🔔 Push-уведомления

---

## 🏗️ Технологии

### Frontend

- React
- TypeScript
- Vite
- PWA

### Backend

- Node.js
- WebSocket (ws)
- PostgreSQL
- JWT
- bcrypt

---

## 🌐 Архитектура

Frontend → Vercel
Backend → VPS (Timeweb)
Database → PostgreSQL

---

## ⚙️ Установка и запуск (локально)

### 1. Клонировать проект

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

---

### 2. Установить зависимости

```bash
npm install
```

---

### 3. Настроить переменные окружения

Создай файл `.env` в корне backend:

```env
PORT=3001
JWT_SECRET=your_secret_key
DATABASE_URL=postgres://user:password@localhost:5432/db_name
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=your@email.com
```

---

### 4. Запустить сервер

```bash
npm run server
```

---

### 5. Запустить frontend

```bash
npm run dev
```

---

## 🔐 Авторизация

- Пользователь может зарегистрироваться или войти
- Новые пользователи требуют подтверждения администратора
- Используется JWT для сессии

---

## 👑 Админ-функции

- Подтверждение входа пользователей
- Отклонение заявок
- Удаление сообщений
- Кик пользователей
- Очистка чата
- Очистка пользователей

---

## 💬 Работа чата

- Сообщения отправляются через WebSocket
- История подгружается после входа
- Все действия синхронизируются в реальном времени

---

## 📱 PWA

Приложение можно установить на смартфон:

- Chrome / Safari → "Добавить на экран"
- Работает как нативное приложение

---

## 🔔 Push-уведомления

- Уведомления о новых сообщениях
- Уведомления администраторам о заявках

---

## ⚠️ Лицензия

Этот проект является частной собственностью.

Любое использование, копирование или распространение без разрешения автора запрещено.

См. файл LICENSE.

---

## 📬 Контакты

Email: [vladimir3dmotion@gmail.com](mailto:vladimir3dmotion@gmail.com)

---

## ⭐ Планы развития

- [ ] Групповые чаты
- [ ] Роли пользователей
- [ ] Файлы и изображения
- [ ] Улучшение UI/UX
- [ ] Мобильная оптимизация

---
