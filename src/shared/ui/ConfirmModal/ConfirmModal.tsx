import styles from './ConfirmModal.module.css'

type ConfirmModalProps = {
	isOpen: boolean
	title: string
	message: string
	confirmText?: string
	cancelText?: string
	confirmVariant?: 'danger' | 'primary'
	onConfirm: () => void
	onCancel: () => void
}

export default function ConfirmModal(props: ConfirmModalProps) {
	const {
		isOpen,
		title,
		message,
		confirmText = 'Подтвердить',
		cancelText = 'Отмена',
		confirmVariant = 'danger',
		onConfirm,
		onCancel,
	} = props

	if (!isOpen) return null

	return (
		<div className={styles.overlay} onClick={onCancel}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<h3 className={styles.title}>{title}</h3>
				<p className={styles.message}>{message}</p>
				<div className={styles.actions}>
					<button
						className={`${styles.button} ${styles.buttonCancel}`}
						onClick={onCancel}
						type="button"
					>
						{cancelText}
					</button>
					<button
						className={`${styles.button} ${
							confirmVariant === 'danger'
								? styles.buttonDanger
								: styles.buttonPrimary
						}`}
						onClick={onConfirm}
						type="button"
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	)
}