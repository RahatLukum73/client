import { useState } from 'react'
import styles from './LoginPage.module.css'

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
		<div className={styles.loginShell}>
			<div className={styles.card}>
				<h1 className={styles.title}>Хутор</h1>

				{/* 🔁 переключатель */}
				<div className={styles.authToggle}>
					<button
						className={mode === 'login' ? styles.active : ''}
						onClick={() => setMode('login')}
					>
						Вход
					</button>
					<button
						className={mode === 'register' ? styles.active : ''}
						onClick={() => setMode('register')}
					>
						Регистрация
					</button>
				</div>

				<div className={styles.label}>
					<input
						className={styles.input}
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Имя"
					/>

					<input
						className={styles.input}
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Пароль"
					/>
				</div>

				<button
					className={styles.button}
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
				{error && <div className={styles.error}>{error}</div>}

				<div className={styles.status}>WS: {wsStatus}</div>
			</div>
		</div>
	)
}
