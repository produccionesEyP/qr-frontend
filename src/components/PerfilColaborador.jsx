import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiSearch, FiTrash2, FiUser } from "react-icons/fi";
import QRCode from "qrcode";
import styles from "../styles/PerfilColaborador.module.css";
import AlertMessage from "./AlertMessage";
import ConfirmModal from "./ConfirmModal";
import {
	buscarColaboradores,
	editarColaborador,
	obtenerColaborador,
	retirarColaborador,
} from "../services/perfilColaboradorService";

const estadoInicialFormulario = {
	idColaborador: "",
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
	fechaIngreso: "",
	horaIngreso: "",
	fotoPerfil: null,
};

const formatearFechaParaInput = (valor) => {
	if (!valor) {
		return "";
	}

	if (typeof valor === "string") {
		return valor.slice(0, 10);
	}

	const fecha = new Date(valor);

	if (Number.isNaN(fecha.getTime())) {
		return String(valor).slice(0, 10);
	}

	const anio = fecha.getFullYear();
	const mes = String(fecha.getMonth() + 1).padStart(2, "0");
	const dia = String(fecha.getDate()).padStart(2, "0");

	return `${anio}-${mes}-${dia}`;
};

const formatearHoraParaInput = (valor) => {
	if (!valor) {
		return "";
	}

	if (typeof valor === "string") {
		return valor.slice(0, 5);
	}

	const fecha = new Date(valor);

	if (Number.isNaN(fecha.getTime())) {
		return String(valor).slice(0, 5);
	}

	const horas = String(fecha.getHours()).padStart(2, "0");
	const minutos = String(fecha.getMinutes()).padStart(2, "0");

	return `${horas}:${minutos}`;
};

function PerfilColaborador({ embebido = false } = {}) {
	const [terminoBusqueda, setTerminoBusqueda] = useState("");
	const [resultados, setResultados] = useState([]);
	const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(null);
	const [qrDataUrl, setQrDataUrl] = useState("");
	const [modoEdicion, setModoEdicion] = useState(false);
	const [formulario, setFormulario] = useState(estadoInicialFormulario);
	const [vistaPreviaFoto, setVistaPreviaFoto] = useState("");
	const [mensaje, setMensaje] = useState("");
	const [error, setError] = useState("");
	const [cargando, setCargando] = useState(false);
	const [confirmarRetiroAbierto, setConfirmarRetiroAbierto] = useState(false);

	const tituloResultado = useMemo(() => {
		if (colaboradorSeleccionado) {
			return `${colaboradorSeleccionado.nombres} ${colaboradorSeleccionado.apellidos}`;
		}

		return "Busca el perfil del colaborador";
	}, [colaboradorSeleccionado]);

	useEffect(() => {
		const generarQr = async () => {
			if (!colaboradorSeleccionado) {
				setQrDataUrl("");
				return;
			}

			try {
				const contenidoQr = `${window.location.origin}/colaborador/${colaboradorSeleccionado.id_colaborador}`;

				const dataUrl = await QRCode.toDataURL(contenidoQr, {
					width: 230,
					margin: 1,
				});

				setQrDataUrl(dataUrl);
			} catch (errorQr) {
				setError("No fue posible generar el QR del perfil.");
			}
		};

		generarQr();
	}, [colaboradorSeleccionado]);

	const limpiarMensajes = () => {
		setMensaje("");
		setError("");
	};

	const manejarBusqueda = async (event) => {
		event.preventDefault();
		limpiarMensajes();
		setCargando(true);

		try {
			const respuesta = await buscarColaboradores(terminoBusqueda);
			setResultados(respuesta.colaboradores || []);

			if (!respuesta.colaboradores?.length) {
				setMensaje("No se encontraron resultados con ese criterio.");
			}
		} catch (errorBusqueda) {
			setError(errorBusqueda.message || "No fue posible buscar colaboradores.");
		} finally {
			setCargando(false);
		}
	};

	const seleccionarColaborador = async (idColaborador) => {
		limpiarMensajes();
		setCargando(true);

		try {
			const respuesta = await obtenerColaborador(idColaborador);
			setColaboradorSeleccionado(respuesta.colaborador);
			setFormulario({
				idColaborador: respuesta.colaborador.id_colaborador,
				nombres: respuesta.colaborador.nombres || "",
				apellidos: respuesta.colaborador.apellidos || "",
				grupoSanguineo: respuesta.colaborador.grupo_sanguineo || "O+",
				tipoDocumento: respuesta.colaborador.tipo_documento || "CC",
				numeroDocumento: respuesta.colaborador.numero_documento || "",
				cargo: respuesta.colaborador.cargo || "",
				area: respuesta.colaborador.area || "",
				celular: respuesta.colaborador.celular || "",
				direccion: respuesta.colaborador.direccion || "",
				sede: respuesta.colaborador.sede || "",
					fechaIngreso: formatearFechaParaInput(respuesta.colaborador.fecha_ingreso),
					horaIngreso: formatearHoraParaInput(respuesta.colaborador.hora_ingreso),
				fotoPerfil: null,
			});
			setVistaPreviaFoto(respuesta.colaborador.foto_perfil_url || "");
			setModoEdicion(false);
		} catch (errorSeleccion) {
			setError(errorSeleccion.message || "No fue posible cargar el perfil.");
		} finally {
			setCargando(false);
		}
	};

	const manejarCambio = (event) => {
		const { name, value, files } = event.target;

		if (name === "fotoPerfil") {
			const archivo = files?.[0] || null;
			setFormulario((estadoActual) => ({
				...estadoActual,
				fotoPerfil: archivo,
			}));

			if (!archivo) {
				setVistaPreviaFoto(colaboradorSeleccionado?.foto_perfil_url || "");
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

	const guardarCambios = async (event) => {
		event.preventDefault();
		limpiarMensajes();
		setCargando(true);

		try {
			const formData = new FormData();
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

			if (formulario.fotoPerfil) {
				formData.append("fotoPerfil", formulario.fotoPerfil);
			}

			const respuesta = await editarColaborador(formulario.idColaborador, formData);
			setColaboradorSeleccionado(respuesta.colaborador);
			setMensaje(respuesta.message || "Colaborador actualizado correctamente.");
			setModoEdicion(false);
			setFormulario((estadoActual) => ({
				...estadoActual,
				fotoPerfil: null,
			}));
		} catch (errorGuardar) {
			setError(errorGuardar.message || "No fue posible guardar los cambios.");
		} finally {
			setCargando(false);
		}
	};

	const manejarRetiro = () => {
		if (!colaboradorSeleccionado) {
			return;
		}

		setConfirmarRetiroAbierto(true);
	};

	const confirmarRetiro = async () => {
		if (!colaboradorSeleccionado) {
			return;
		}

		limpiarMensajes();
		setCargando(true);

		try {
			const idRetirado = colaboradorSeleccionado.id_colaborador;
			const respuesta = await retirarColaborador(idRetirado);
			setResultados((previos) => previos.filter((item) => item.id_colaborador !== idRetirado));
			setColaboradorSeleccionado(null);
			setQrDataUrl("");
			setFormulario(estadoInicialFormulario);
			setVistaPreviaFoto("");
			setMensaje(respuesta.message || "Colaborador retirado correctamente.");
			setModoEdicion(false);
			setConfirmarRetiroAbierto(false);
		} catch (errorRetiro) {
			setError(errorRetiro.message || "No fue posible retirar el colaborador.");
		} finally {
			setCargando(false);
		}
	};

	return (
		<section className={`${styles.pagina} ${embebido ? styles.embebido : ""}`}>
			<div className={styles.cabeceraModulo}>
				<div>
					<p className={styles.etiquetaCabecera}>Modulo de ediccion y retiro de colaboradores</p>
					<h2 className={styles.tituloModulo}>{tituloResultado}</h2>
				</div>
			</div>

			<form className={styles.buscador} onSubmit={manejarBusqueda}>
				<label className={styles.etiqueta} htmlFor="terminoBusqueda">
					Buscar por id, nombres o cedula
				</label>
				<div className={styles.filaBusqueda}>
					<input
						id="terminoBusqueda"
						type="text"
						className={styles.campoBusqueda}
						placeholder="Ej: 1, Juan Perez o 123456789"
						value={terminoBusqueda}
						onChange={(event) => setTerminoBusqueda(event.target.value)}
					/>
					<button type="submit" className={styles.botonPrincipal} disabled={cargando}>
						<FiSearch /> Buscar
					</button>
				</div>
			</form>

			<div className={styles.contenidoPrincipal}>
				<aside className={styles.tarjetaResultados}>
					<h3 className={styles.subtituloSeccion}>Resultados</h3>
					<div className={styles.listaResultados}>
						{resultados.length ? (
							resultados.map((colaborador) => (
								<button
									key={colaborador.id_colaborador}
									type="button"
									className={styles.tarjetaResultadoItem}
									onClick={() => seleccionarColaborador(colaborador.id_colaborador)}
								>
									<FiUser className={styles.iconoResultado} />
									<div>
										<strong>
											{colaborador.nombres} {colaborador.apellidos}
										</strong>
										<p>
											ID: {colaborador.id_colaborador} | CC: {colaborador.numero_documento}
										</p>
									</div>
								</button>
							))
						) : (
							<p className={styles.textoVacio}>Aun no hay resultados. Realiza una busqueda para comenzar.</p>
						)}
					</div>
				</aside>

				<section className={styles.tarjetaPerfil}>
					{colaboradorSeleccionado ? (
						<form className={styles.formularioPerfil} onSubmit={guardarCambios}>
							<div className={styles.bloqueFoto}>
								<div className={styles.vistaFoto}>
									{vistaPreviaFoto ? (
										<img src={vistaPreviaFoto} alt="Foto del colaborador" className={styles.imagenFoto} />
									) : (
										<div className={styles.placeholderFoto}>Sin foto disponible</div>
									)}
								</div>

								{modoEdicion ? (
									<>
										<label className={styles.etiqueta} htmlFor="fotoPerfil">
											Cambiar foto
										</label>
										<input
											id="fotoPerfil"
											name="fotoPerfil"
											type="file"
											accept="image/*"
											className={styles.campoArchivo}
											onChange={manejarCambio}
										/>
									</>
								) : null}
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
										value={formulario.nombres}
										onChange={manejarCambio}
										disabled={!modoEdicion}
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
										value={formulario.apellidos}
										onChange={manejarCambio}
										disabled={!modoEdicion}
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
										disabled={!modoEdicion}
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
										disabled={!modoEdicion}
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
										Cedula
									</label>
									<input
										id="numeroDocumento"
										name="numeroDocumento"
										type="text"
										className={styles.campo}
										value={formulario.numeroDocumento}
										onChange={manejarCambio}
										disabled={!modoEdicion}
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
										value={formulario.cargo}
										onChange={manejarCambio}
										disabled={!modoEdicion}
										required
									/>
								</div>

								<div>
									<label className={styles.etiqueta} htmlFor="area">
										Area
									</label>
									<input
										id="area"
										name="area"
										type="text"
										className={styles.campo}
										value={formulario.area}
										onChange={manejarCambio}
										disabled={!modoEdicion}
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
									value={formulario.celular}
									onChange={manejarCambio}
									disabled={!modoEdicion}
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
									value={formulario.direccion}
									onChange={manejarCambio}
									disabled={!modoEdicion}
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
									value={formulario.sede}
									onChange={manejarCambio}
									disabled={!modoEdicion}
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
										disabled={!modoEdicion}
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
										disabled={!modoEdicion}
										required
									/>
								</div>
							</div>

							<div className={styles.accionesPerfil}>
								<button
									type="button"
									className={styles.botonEdicion}
									onClick={() => setModoEdicion((estadoActual) => !estadoActual)}
									disabled={!colaboradorSeleccionado}
								>
									<FiEdit2 /> {modoEdicion ? "Ver perfil" : "Editar perfil"}
								</button>

								{modoEdicion ? (
									<button type="submit" className={styles.botonPrincipal} disabled={cargando}>
										{cargando ? "Guardando..." : "Guardar cambios"}
									</button>
								) : null}
								<button type="button" className={styles.botonPeligro} onClick={manejarRetiro} disabled={!colaboradorSeleccionado || cargando}>
									<FiTrash2 /> Retirar colaborador
								</button>
							</div>

							<AlertMessage message={error} type="error" onClose={() => setError("")} />
							<AlertMessage message={mensaje} type="success" onClose={() => setMensaje("")} />
						</form>
					) : (
						<div className={styles.estadoVacio}>
							<p className={styles.textoVacio}>
								Busca un colaborador por id, nombres o cedula para ver su perfil aqui.
							</p>
							<AlertMessage message={error} type="error" onClose={() => setError("")} />
							<AlertMessage message={mensaje} type="success" onClose={() => setMensaje("")} />
						</div>
					)}
				</section>
			</div>

			{colaboradorSeleccionado ? (
				<section className={styles.bloqueQr}>
					<h3 className={styles.subtituloSeccion}>QR del perfil</h3>
					{qrDataUrl ? <img src={qrDataUrl} alt="QR del perfil" className={styles.qrImagen} /> : null}
				</section>
			) : null}

			<ConfirmModal
				open={confirmarRetiroAbierto}
				title="¿Estas seguro de retirar el colaborador?"
				description={
					colaboradorSeleccionado
						? `Se retirará a ${colaboradorSeleccionado.nombres} ${colaboradorSeleccionado.apellidos}.`
						: ""
				}
				onCancel={() => setConfirmarRetiroAbierto(false)}
				onConfirm={confirmarRetiro}
				confirmText="Confirmar"
				cancelText="Cancelar"
			/>
		</section>
	);
}

export default PerfilColaborador;