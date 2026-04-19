import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiQrCodeLine } from "react-icons/ri";
import styles from "../styles/Login.module.css";
import { login } from "../services/authService";
import { saveAuthSession } from "../services/sessionService";
import AlertMessage from "./AlertMessage";

function InicioSesion() {
	const navigate = useNavigate();
	const [mostrarContrasena, setMostrarContrasena] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [recordarme, setRecordarme] = useState(true);
	const [cargando, setCargando] = useState(false);
	const [error, setError] = useState("");
	const [mensajeExito, setMensajeExito] = useState("");

	const manejarEnvio = async (event) => {
		event.preventDefault();
		setError("");
		setMensajeExito("");
		setCargando(true);

		try {
			const respuesta = await login({ email, password });

			saveAuthSession({
				token: respuesta.token,
				user: respuesta.usuario,
				recordarSesion: recordarme,
			});
			setMensajeExito(`Bienvenido, ${respuesta.usuario.nombre}.`);
			
			// Redirigir a Welcome después de 500ms para que vea el mensaje de éxito
			setTimeout(() => {
				navigate("/welcome");
			}, 500);
		} catch (err) {
			setError(err.message || "No fue posible iniciar sesion.");
		} finally {
			setCargando(false);
		}
	};

	const cambiarVisibilidadContrasena = () => {
		setMostrarContrasena((estadoActual) => !estadoActual);
	};

	return (
		// Contenedor principal con fondo animado.
		<main className={styles.pagina}>
			{/* Capas visuales del fondo para dar profundidad y movimiento */}
			<div className={styles.brilloFondoUno} aria-hidden="true" />
			<div className={styles.brilloFondoDos} aria-hidden="true" />

			<div className={styles.contenedorTarjetas}>
				{/* Tarjeta visual de marca */}
				<section className={styles.tarjetaMarca}>
					<RiQrCodeLine className={styles.qrAnimado} aria-hidden="true" />
					<div className={styles.lineaQr} aria-hidden="true" />
					<h1 className={styles.marca}>Codex</h1>
					<p className={styles.fraseMarca}>"Ingresa, Escanea y Controla."</p>
				</section>

				{/* Tarjeta de inicio de sesion */}
				<section className={styles.tarjeta}>
					<header className={styles.encabezado}>
						<h2 className={styles.tituloLogin}>Bienvenido</h2>
						<p className={styles.subtitulo}>Inicia sesión para continuar</p>
					</header>

					{/* Formulario base de acceso */}
					<form className={styles.formulario} onSubmit={manejarEnvio}>
						<label className={styles.etiqueta} htmlFor="email">
							Correo
						</label>
						<input
							id="email"
							name="email"
							type="email"
							className={styles.campo}
							placeholder="tu@empresa.com"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
						/>

						<label className={styles.etiqueta} htmlFor="password">
							Contraseña
						</label>

						<div className={styles.contenedorContrasena}>
							<input
								id="password"
								name="password"
								type={mostrarContrasena ? "text" : "password"}
								className={styles.campo}
								placeholder="********"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
							/>
							<button
								type="button"
								onClick={cambiarVisibilidadContrasena}
								className={`${styles.botonOjo} ${mostrarContrasena ? "" : styles.ojoOculto}`}
								aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
							>
								<span className={styles.iconoOjo} aria-hidden="true">
									<span className={styles.pupila} />
								</span>
							</button>
						</div>

						<label className={styles.recordarme}>
							<input
								type="checkbox"
								className={styles.casilla}
								name="recordarme"
								checked={recordarme}
								onChange={(event) => setRecordarme(event.target.checked)}
							/>
							<span>Recordarme</span>
						</label>

						<p className={styles.textoAyuda}>
							Olvidaste tu contraseña? Comunícate con el administrador.
						</p>

						<button type="submit" className={styles.boton} disabled={cargando}>
							{cargando ? "Validando..." : "Entrar"}
						</button>

						<p className={styles.textoRegistro}>
							Aún no haces parte de Codex? Comunícate con nosotros.
						</p>

						<AlertMessage message={error} type="error" onClose={() => setError("")} />
						<AlertMessage message={mensajeExito} type="success" onClose={() => setMensajeExito("")} />
					</form>
				</section>
			</div>
		</main>
	);
}

export default InicioSesion;
