import React, { useState } from "react";
import styles from "../styles/FormularioRegistro.module.css";
import { register } from "../services/authService";
import AlertMessage from "./AlertMessage";

function FormularioRegistro() {
	const [formulario, setFormulario] = useState({
		nombre: "",
		tipoDocumento: "CC",
		numeroDocumento: "",
		email: "",
		password: "",
		rol: "usuario",
		estado: "activo",
	});
	const [cargando, setCargando] = useState(false);
	const [error, setError] = useState("");
	const [exito, setExito] = useState("");

	const actualizarCampo = (event) => {
		const { name, value } = event.target;
		setFormulario((estadoActual) => ({
			...estadoActual,
			[name]: value,
		}));
	};

	const manejarEnvio = async (event) => {
		event.preventDefault();
		setError("");
		setExito("");
		setCargando(true);

		try {
			const respuesta = await register(formulario);
			setExito(respuesta.message || "Usuario registrado correctamente.");
			setFormulario((estadoActual) => ({
				...estadoActual,
				nombre: "",
				numeroDocumento: "",
				email: "",
				password: "",
			}));
		} catch (err) {
			setError(err.message || "No fue posible registrar el usuario.");
		} finally {
			setCargando(false);
		}
	};

	return (
		<main className={styles.pagina}>
			<div className={styles.brilloFondoUno} aria-hidden="true" />
			<div className={styles.brilloFondoDos} aria-hidden="true" />

			<section className={styles.tarjeta}>
				<header className={styles.encabezado}>
					<h2 className={styles.tituloLogin}>Registrar usuario</h2>
					<p className={styles.subtitulo}>Completa los datos para generar el acceso</p>
				</header>

				<form className={styles.formulario} onSubmit={manejarEnvio}>
					<div className={styles.gridFormulario}>
						<div className={styles.campoCompleto}>
							<label className={styles.etiqueta} htmlFor="nombre">
								Nombres
							</label>
							<input
								id="nombre"
								name="nombre"
								type="text"
								className={styles.campo}
								placeholder="Nombres y apellidos"
								value={formulario.nombre}
								onChange={actualizarCampo}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="tipoDocumento">
								Tipo de documento
							</label>
							<select
								id="tipoDocumento"
								name="tipoDocumento"
								className={styles.campo}
								value={formulario.tipoDocumento}
								onChange={actualizarCampo}
								required
							>
								<option value="CC">Cédula de ciudadanía</option>
								<option value="TI">Tarjeta de identidad</option>
								<option value="CE">Cédula de extranjería</option>
								<option value="PP">Pasaporte</option>
                                <option value="PPT">PPT</option>
							</select>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="numeroDocumento">
								Número de documento
							</label>
							<input
								id="numeroDocumento"
								name="numeroDocumento"
								type="text"
								className={styles.campo}
								placeholder="123456789"
								value={formulario.numeroDocumento}
								onChange={actualizarCampo}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="rol">
								Rol
							</label>
							<select
								id="rol"
								name="rol"
								className={styles.campo}
								value={formulario.rol}
								onChange={actualizarCampo}
								required
							>
								<option value="usuario">Usuario</option>
								<option value="administrador">Administrador</option>
							</select>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="email">
								Correo
							</label>
							<input
								id="email"
								name="email"
								type="email"
								className={styles.campo}
								placeholder="tu@empresa.com"
								value={formulario.email}
								onChange={actualizarCampo}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="estado">
								Estado
							</label>
							<select
								id="estado"
								name="estado"
								className={styles.campo}
								value={formulario.estado}
								onChange={actualizarCampo}
								required
							>
								<option value="activo">Activo</option>
								<option value="inactivo">Inactivo</option>
							</select>
						</div>

						<div className={styles.campoCompleto}>
							<label className={styles.etiqueta} htmlFor="password">
								Contraseña
							</label>
							<input
								id="password"
								name="password"
								type="password"
								className={styles.campo}
								placeholder="Mínimo 6 caracteres"
								value={formulario.password}
								onChange={actualizarCampo}
								required
							/>
						</div>
					</div>

					<button type="submit" className={styles.boton} disabled={cargando}>
						{cargando ? "Registrando..." : "Crear cuenta"}
					</button>

					<AlertMessage message={error} type="error" onClose={() => setError("")} />
					<AlertMessage message={exito} type="success" onClose={() => setExito("")} />
				</form>
			</section>
		</main>
	);
}

export default FormularioRegistro;
