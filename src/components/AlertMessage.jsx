import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/AlertMessage.module.css";

function AlertMessage({
	message,
	type = "success",
	onClose,
	autoClose = true,
	duration = 8000,
}) {
	const [visibleMessage, setVisibleMessage] = useState("");
	const [isLeaving, setIsLeaving] = useState(false);
	const closeTimerRef = useRef(null);
	const dismissTimerRef = useRef(null);

	const clearTimers = () => {
		if (closeTimerRef.current) {
			window.clearTimeout(closeTimerRef.current);
			closeTimerRef.current = null;
		}

		if (dismissTimerRef.current) {
			window.clearTimeout(dismissTimerRef.current);
			dismissTimerRef.current = null;
		}
	};

	const triggerClose = () => {
		if (!onClose || isLeaving) {
			return;
		}

		setIsLeaving(true);
		clearTimers();

		dismissTimerRef.current = window.setTimeout(() => {
			onClose();
		}, 220);
	};

	useEffect(() => {
		if (!message) {
			setIsLeaving(false);
			setVisibleMessage("");
			clearTimers();
			return undefined;
		}

		setVisibleMessage(message);
		setIsLeaving(false);

		return undefined;
	}, [message]);

	useEffect(() => {
		if (!visibleMessage || !onClose || !autoClose) {
			return undefined;
		}

		clearTimers();

		closeTimerRef.current = window.setTimeout(() => {
			triggerClose();
		}, duration);

		return () => {
			clearTimers();
		};
	}, [visibleMessage, onClose, autoClose, duration]);

	if (!visibleMessage) {
		return null;
	}

	const variantClass = type === "error" ? styles.error : styles.success;
	const stateClass = isLeaving ? styles.salir : styles.entrar;

	return (
		<div className={`${styles.alerta} ${variantClass} ${stateClass}`} role="alert" aria-live="polite">
			<span className={styles.mensaje}>{visibleMessage}</span>
			{onClose ? (
				<button type="button" className={styles.botonCerrar} onClick={triggerClose} aria-label="Cerrar alerta">
					x
				</button>
			) : null}
		</div>
	);
}

export default AlertMessage;
