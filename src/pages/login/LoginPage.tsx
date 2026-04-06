import { useState } from 'react'
import '../../app/telegram.css'

type SocketStatus = 'disconnected' | 'connecting' | 'connected'

export default function LoginPage(props: {
	wsStatus: SocketStatus
	onLogin: (name: string, password: string) => void
	onRegister: (name: string, password: string) => void
	error?: string
}) {
	const { wsStatus, onLogin, onRegister, error } = props

	const [name, setName] = useState('')
	const [password, setPassword] = useState('')
	const [mode, setMode] = useState<'login' | 'register'>('register')

	const canSubmit =
		name.trim().length > 0 && password.length >= 6 && wsStatus === 'connected'

	return (
		<div className="tg-shell">
			<div className="tg-card">
				<h1 className="tg-title">Хутор</h1>

				{/* 🔁 переключатель */}
				<div className="tg-auth">
					<button
						className={mode === 'login' ? 'active' : ''}
						onClick={() => setMode('login')}
					>
						Вход
					</button>
					<button
						className={mode === 'register' ? 'active' : ''}
						onClick={() => setMode('register')}
					>
						Регистрация
					</button>
				</div>

				<label className="tg-label">
					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Имя"
					/>

					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Пароль"
					/>
				</label>

				<button
					className="tg-button"
					disabled={!canSubmit}
					onClick={() => {
						if (mode === 'login') {
							onLogin(name, password)
						} else {
							onRegister(name, password)
						}
					}}
				>
					{mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
				</button>

				{/* ❗ ошибка */}
				{error && (
					<div style={{ color: 'red', marginTop: 10 }}>{error}</div>
				)}

				<div>WS: {wsStatus}</div>
			</div>
		</div>
	)
}
