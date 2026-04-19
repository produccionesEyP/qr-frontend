import React, { useEffect } from "react";
import styles from "../styles/ConfirmModal.module.css";

function ConfirmModal({
	open,
	title = "Confirmar acción",
	description,
	onConfirm,
	onCancel,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	closeOnOverlay = true,
}) {
	useEffect(() => {
		if (!open) {
			return undefined;
		}

		const handleEscape = (event) => {
			if (event.key === "Escape") {
				onCancel();
			}
		};

		window.addEventListener("keydown", handleEscape);

		return () => {
			window.removeEventListener("keydown", handleEscape);
		};
	}, [open, onCancel]);

	if (!open) {
		return null;
	}

	const handleOverlayClick = (event) => {
		if (event.target === event.currentTarget && closeOnOverlay) {
			onCancel();
		}
	};

	return (
		<div
			className={styles.overlay}
			role="dialog"
			aria-modal="true"
			aria-labelledby="confirm-modal-title"
			onClick={handleOverlayClick}
		>
			<div className={styles.modal} onClick={(event) => event.stopPropagation()}>
				<h3 id="confirm-modal-title" className={styles.title}>
					{title}
				</h3>
				{description ? <p className={styles.description}>{description}</p> : null}
				<div className={styles.actions}>
					<button type="button" className={styles.cancelButton} onClick={onCancel}>
						{cancelText}
					</button>
					<button type="button" className={styles.confirmButton} onClick={onConfirm}>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ConfirmModal;
