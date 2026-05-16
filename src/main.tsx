import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './app/telegram.css'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)

// Service Worker + push subscriptions for PWA.
if ('serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		try {
			const registration = await navigator.serviceWorker.register('/sw.js?v=1.1.9')

			console.log('[SW] registered', registration)

		} catch (err) {
			console.error('[SW] registration failed', err)
		}
	})
}
