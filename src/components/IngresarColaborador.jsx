import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { FiArrowLeft, FiCamera, FiPrinter, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "../styles/IngresarColaborador.module.css";
import { crearColaborador } from "../services/colaboradorService";
import AlertMessage from "./AlertMessage";

const obtenerFechaActual = () => new Date().toISOString().slice(0, 10);

const obtenerHoraActual = () => new Date().toTimeString().slice(0, 5);

const formularioInicial = {
	fotoPerfil: null,
	nombres: "",
	apellidos: "",
	grupoSanguineo: "O+",
	tipoDocumento: "CC",
	numeroDocumento: "",
	cargo: "",
	area: "",
	celular: "",
	direccion: "",
	sede: "",
	fechaIngreso: obtenerFechaActual(),
	horaIngreso: obtenerHoraActual(),
};

function IngresarColaborador({ embebido = false } = {}) {
	const navigate = useNavigate();
	const [formulario, setFormulario] = useState(formularioInicial);
	const [vistaPreviaFoto, setVistaPreviaFoto] = useState("");
	const [colaboradorGuardado, setColaboradorGuardado] = useState(null);
	const [qrDataUrl, setQrDataUrl] = useState("");
	const [cargando, setCargando] = useState(false);
	const [cargandoQr, setCargandoQr] = useState(false);
	const [error, setError] = useState("");
	const [mensajeExito, setMensajeExito] = useState("");

	useEffect(() => {
		// Cuando ya tenemos colaborador guardado, generamos el QR con sus datos principales.
		const generarQr = async () => {
			if (!colaboradorGuardado) {
				setQrDataUrl("");
				return;
			}

			setCargandoQr(true);

			try {
				const contenidoQr = `${window.location.origin}/colaborador/${colaboradorGuardado.id_colaborador}`;

				const dataUrl = await QRCode.toDataURL(contenidoQr, {
					width: 260,
					margin: 1,
					errorCorrectionLevel: "M",
					color: {
						dark: "#000000",
						light: "#ffffff",
					},
				});

				setQrDataUrl(dataUrl);
			} catch (errorQr) {
				setError("No fue posible generar el QR del colaborador.");
			} finally {
				setCargandoQr(false);
			}
		};

		generarQr();
	}, [colaboradorGuardado]);

	const manejarCambio = (event) => {
		const { name, value, files } = event.target;

		if (name === "fotoPerfil") {
			const archivo = files?.[0] || null;
			setFormulario((estadoActual) => ({
				...estadoActual,
				fotoPerfil: archivo,
			}));

			if (!archivo) {
				setVistaPreviaFoto("");
				return;
			}

			const lector = new FileReader();
			lector.onload = () => setVistaPreviaFoto(String(lector.result || ""));
			lector.readAsDataURL(archivo);
			return;
		}

		setFormulario((estadoActual) => ({
			...estadoActual,
			[name]: value,
		}));
	};

	const manejarEnvio = async (event) => {
		event.preventDefault();
		setError("");
		setMensajeExito("");
		setCargando(true);

		try {
			const formData = new FormData();

			formData.append("fotoPerfil", formulario.fotoPerfil);
			formData.append("nombres", formulario.nombres);
			formData.append("apellidos", formulario.apellidos);
			formData.append("grupoSanguineo", formulario.grupoSanguineo);
			formData.append("tipoDocumento", formulario.tipoDocumento);
			formData.append("numeroDocumento", formulario.numeroDocumento);
			formData.append("cargo", formulario.cargo);
			formData.append("area", formulario.area);
			formData.append("celular", formulario.celular);
			formData.append("direccion", formulario.direccion);
			formData.append("sede", formulario.sede);
			formData.append("fechaIngreso", formulario.fechaIngreso);
			formData.append("horaIngreso", formulario.horaIngreso);

			const respuesta = await crearColaborador(formData);

			setColaboradorGuardado(respuesta.colaborador);
			setMensajeExito(respuesta.message || "Colaborador guardado correctamente.");
			setFormulario(formularioInicial);
			setVistaPreviaFoto("");
		} catch (errorRegistro) {
			setError(errorRegistro.message || "No fue posible guardar el colaborador.");
		} finally {
			setCargando(false);
		}
	};

	const manejarImpresion = () => {
		window.print();
	};

	return (
		<section className={`${styles.pagina} ${embebido ? styles.embebido : ""}`}>
			<header className={styles.encabezadoPagina}>
				{embebido ? null : (
					<button type="button" className={styles.botonSecundario} onClick={() => navigate("/DashboardUsuario")}>
						<FiArrowLeft /> Volver al dashboard
					</button>
				)}

				<div className={styles.titulosCabecera}>
					<h1 className={styles.tituloPagina}>Ingresar colaborador</h1>
				</div>
			</header>

			<section className={styles.contenidoPrincipal}>
				<form className={styles.tarjetaFormulario} onSubmit={manejarEnvio}>
					<div className={styles.bloqueFoto}>
						<div className={styles.vistaFoto}>
							{vistaPreviaFoto ? (
								<img src={vistaPreviaFoto} alt="Vista previa del colaborador" className={styles.imagenFoto} />
							) : (
								<div className={styles.placeholderFoto}>
									<FiCamera />
									<span>Sube una foto de perfil</span>
								</div>
							)}
						</div>

						<label className={styles.etiqueta} htmlFor="fotoPerfil">
							Foto de perfil
						</label>
						<input
							id="fotoPerfil"
							name="fotoPerfil"
							type="file"
							accept="image/*"
							className={styles.campoArchivo}
							onChange={manejarCambio}
							required
						/>
					</div>

					<div className={styles.gridFormulario}>
						<div>
							<label className={styles.etiqueta} htmlFor="nombres">
								Nombres
							</label>
							<input
								id="nombres"
								name="nombres"
								type="text"
								className={styles.campo}
								placeholder="Nombres del colaborador"
								value={formulario.nombres}
								onChange={manejarCambio}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="apellidos">
								Apellidos
							</label>
							<input
								id="apellidos"
								name="apellidos"
								type="text"
								className={styles.campo}
								placeholder="Apellidos del colaborador"
								value={formulario.apellidos}
								onChange={manejarCambio}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="grupoSanguineo">
								Grupo sanguineo (GS)
							</label>
							<select
								id="grupoSanguineo"
								name="grupoSanguineo"
								className={styles.campo}
								value={formulario.grupoSanguineo}
								onChange={manejarCambio}
								required
							>
								<option value="O+">O+</option>
								<option value="O-">O-</option>
								<option value="A+">A+</option>
								<option value="A-">A-</option>
								<option value="B+">B+</option>
								<option value="B-">B-</option>
								<option value="AB+">AB+</option>
								<option value="AB-">AB-</option>
							</select>
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
								onChange={manejarCambio}
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
								onChange={manejarCambio}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="cargo">
								Cargo
							</label>
							<input
								id="cargo"
								name="cargo"
								type="text"
								className={styles.campo}
								placeholder="Cargo del colaborador"
								value={formulario.cargo}
								onChange={manejarCambio}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="area">
								Área
							</label>
							<input
								id="area"
								name="area"
								type="text"
								className={styles.campo}
								placeholder="Área o departamento"
								value={formulario.area}
								onChange={manejarCambio}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="celular">
								Celular
							</label>
							<input
								id="celular"
								name="celular"
								type="tel"
								className={styles.campo}
								placeholder="3001234567"
								value={formulario.celular}
								onChange={manejarCambio}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="direccion">
								Dirección
							</label>
							<input
								id="direccion"
								name="direccion"
								type="text"
								className={styles.campo}
								placeholder="Dirección de residencia o trabajo"
								value={formulario.direccion}
								onChange={manejarCambio}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="sede">
								Sede
							</label>
							<input
								id="sede"
								name="sede"
								type="text"
								className={styles.campo}
								placeholder="Sede principal"
								value={formulario.sede}
								onChange={manejarCambio}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="fechaIngreso">
								Fecha de ingreso
							</label>
							<input
								id="fechaIngreso"
								name="fechaIngreso"
								type="date"
								className={styles.campo}
								value={formulario.fechaIngreso}
								onChange={manejarCambio}
								required
							/>
						</div>

						<div>
							<label className={styles.etiqueta} htmlFor="horaIngreso">
								Hora de ingreso
							</label>
							<input
								id="horaIngreso"
								name="horaIngreso"
								type="time"
								className={styles.campo}
								value={formulario.horaIngreso}
								onChange={manejarCambio}
								required
							/>
						</div>
					</div>

					<div className={styles.accionesFormulario}>
						<button type="submit" className={styles.botonPrincipal} disabled={cargando}>
							{cargando ? "Guardando..." : "Guardar colaborador"}
						</button>
						<p className={styles.textoAyuda}>
							Al guardar, la informacion quedara disponible para el perfil del colaborador.
						</p>
					</div>

					<AlertMessage message={error} type="error" onClose={() => setError("")} />
					<AlertMessage message={mensajeExito} type="success" onClose={() => setMensajeExito("")} />
				</form>

				<aside className={styles.tarjetaResultado}>
					<h2 className={styles.tituloResultado}>Ingreso y QR</h2>

					<div className={styles.resumenColaborador}>
						<FiUser className={styles.iconoResumen} />
						{colaboradorGuardado ? (
							<div>
								<p className={styles.nombreResumen}>
									{colaboradorGuardado.nombres} {colaboradorGuardado.apellidos}
								</p>
								<p className={styles.detalleResumen}>
									ID: {colaboradorGuardado.id_colaborador} | Codigo: {colaboradorGuardado.codigo_colaborador}
								</p>
								<p className={styles.detalleResumen}>
									{colaboradorGuardado.cargo} - {colaboradorGuardado.area}
								</p>
								<p className={styles.detalleResumen}>
									GS: {colaboradorGuardado.grupo_sanguineo || "-"}
								</p>
								<p className={styles.detalleResumen}>
									Celular: {colaboradorGuardado.celular} | Sede: {colaboradorGuardado.sede}
								</p>
								<p className={styles.detalleResumen}>
									Dirección: {colaboradorGuardado.direccion}
								</p>
							</div>
						) : (
							<p className={styles.detalleResumen}>
								Completa el formulario para generar el QR y dejar el registro listo para el perfil.
							</p>
						)}
					</div>

					<div className={styles.zonaImpresion}>
						{cargandoQr ? (
							<p className={styles.detalleResumen}>Generando QR...</p>
						) : qrDataUrl ? (
							<>
								<img src={qrDataUrl} alt="QR del colaborador" className={styles.qrImagen} />
								<p className={styles.detalleResumen}>
									Este QR quedará asociado al colaborador guardado.
								</p>
								<button type="button" className={styles.botonSecundario} onClick={manejarImpresion}>
									<FiPrinter /> Imprimir QR
								</button>
							</>
						) : (
							<p className={styles.detalleResumen}>
								Aqui aparecerá el QR generado despues de ingresae el nuevo colaborador.
							</p>
						)}
					</div>
				</aside>
			</section>
		</section>
	);
}

export default IngresarColaborador;