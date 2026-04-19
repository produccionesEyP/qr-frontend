import React, { useEffect, useMemo, useState } from "react";
import { FiDownload, FiEdit2, FiEye, FiEyeOff, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import * as XLSX from "xlsx";
import styles from "../styles/GestionarUsuarios.module.css";
import AlertMessage from "./AlertMessage";
import ConfirmModal from "./ConfirmModal";
import {
	actualizarUsuario,
	eliminarUsuario,
	listarUsuarios,
} from "../services/usuarioAdminService";

const estadoInicialFormulario = {
	nombre: "",
	tipoDocumento: "CC",
	numeroDocumento: "",
	email: "",
	password: "",
	rol: "usuario",
	estado: "activo",
};

function GestionarUsuarios({ embebido = false } = {}) {
	const [termino, setTermino] = useState("");
	const [usuarios, setUsuarios] = useState([]);
	const [totalUsuarios, setTotalUsuarios] = useState(0);
	const [cargando, setCargando] = useState(false);
	const [error, setError] = useState("");
	const [mensaje, setMensaje] = useState("");
	const [modalAbierto, setModalAbierto] = useState(false);
	const [usuarioEditando, setUsuarioEditando] = useState(null);
	const [formulario, setFormulario] = useState(estadoInicialFormulario);
	const [mostrarPassword, setMostrarPassword] = useState(false);
	const [usuarioPendienteEliminar, setUsuarioPendienteEliminar] = useState(null);

	const totalResultados = useMemo(() => usuarios.length, [usuarios]);

	const cargarUsuarios = async (terminoBusqueda = "") => {
		setCargando(true);
		setError("");

		try {
			const respuesta = await listarUsuarios(terminoBusqueda);
			setUsuarios(respuesta.usuarios || []);
			setTotalUsuarios(Number(respuesta.totalUsuarios || 0));
		} catch (errorConsulta) {
			setError(errorConsulta.message || "No fue posible cargar usuarios.");
		} finally {
			setCargando(false);
		}
	};

	useEffect(() => {
		cargarUsuarios("");
	}, []);

	const manejarBusqueda = async (event) => {
		event.preventDefault();
		setMensaje("");
		await cargarUsuarios(termino.trim());
	};

	const abrirModalEdicion = (usuario) => {
		setUsuarioEditando(usuario);
		setFormulario({
			nombre: usuario.nombre || "",
			tipoDocumento: usuario.tipo_documento || "CC",
			numeroDocumento: usuario.numero_documento || "",
			email: usuario.email || "",
			password: "",
			rol: usuario.rol || "usuario",
			estado: usuario.estado || "activo",
		});
		setMostrarPassword(false);
		setModalAbierto(true);
	};

	const cerrarModal = () => {
		setModalAbierto(false);
		setUsuarioEditando(null);
		setFormulario(estadoInicialFormulario);
		setMostrarPassword(false);
	};

	const manejarCambio = (event) => {
		const { name, value } = event.target;
		setFormulario((actual) => ({
			...actual,
			[name]: value,
		}));
	};

	const guardarEdicion = async (event) => {
		event.preventDefault();
		setError("");
		setMensaje("");

		if (!usuarioEditando) {
			return;
		}

		try {
			const payload = {
				nombre: formulario.nombre,
				tipoDocumento: formulario.tipoDocumento,
				numeroDocumento: formulario.numeroDocumento,
				email: formulario.email,
				rol: formulario.rol,
				estado: formulario.estado,
			};

			if (formulario.password.trim()) {
				payload.password = formulario.password.trim();
			}

			await actualizarUsuario(usuarioEditando.id, payload);
			setMensaje("Usuario actualizado correctamente.");
			cerrarModal();
			await cargarUsuarios(termino.trim());
		} catch (errorEdicion) {
			setError(errorEdicion.message || "No fue posible actualizar el usuario.");
		}
	};

	const manejarEliminar = (usuario) => {
		setUsuarioPendienteEliminar(usuario);
	};

	const confirmarEliminar = async () => {
		if (!usuarioPendienteEliminar) {
			return;
		}

		setError("");
		setMensaje("");

		try {
			await eliminarUsuario(usuarioPendienteEliminar.id);
			setMensaje("Usuario eliminado correctamente.");
			setUsuarioPendienteEliminar(null);
			await cargarUsuarios(termino.trim());
		} catch (errorEliminar) {
			setError(errorEliminar.message || "No fue posible eliminar el usuario.");
		}
	};

	const exportarExcel = () => {
		if (!usuarios.length) {
			setMensaje("No hay usuarios para exportar en Excel con el filtro actual.");
			return;
		}

		const filas = usuarios.map((usuario) => ({
			ID: usuario.id,
			NOMBRE: usuario.nombre,
			TIPO_DOCUMENTO: usuario.tipo_documento,
			NUMERO_DOCUMENTO: usuario.numero_documento,
			EMAIL: usuario.email,
			ROL: usuario.rol,
			ESTADO: usuario.estado,
		}));

		const hoja = XLSX.utils.json_to_sheet(filas);
		const libro = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(libro, hoja, "Usuarios");
		XLSX.writeFile(libro, `usuarios_codex_${new Date().toISOString().slice(0, 10)}.xlsx`);
	};

	return (
		<section className={`${styles.pagina} ${embebido ? styles.embebido : ""}`}>
			<div className={styles.cabecera}>
				<p className={styles.etiqueta}>Administracion de usuarios</p>
				<h2 className={styles.titulo}>Gestionar Usuarios</h2>
			</div>

			<div className={styles.tarjetasResumen}>
				<article className={styles.tarjetaResumen}>
					<FiUsers className={styles.iconoResumen} />
					<div>
						<p className={styles.etiquetaResumen}>Total usuarios</p>
						<strong className={styles.valorResumen}>{totalUsuarios}</strong>
					</div>
				</article>

				<article className={styles.tarjetaResumen}>
					<FiSearch className={styles.iconoResumen} />
					<div>
						<p className={styles.etiquetaResumen}>Resultados</p>
						<strong className={styles.valorResumen}>{totalResultados}</strong>
					</div>
				</article>
			</div>

			<form className={styles.buscador} onSubmit={manejarBusqueda}>
				<label htmlFor="terminoUsuario" className={styles.label}>
					Buscar por ID, nombre o cedula
				</label>
				<div className={styles.filaBusqueda}>
					<input
						id="terminoUsuario"
						type="text"
						className={styles.campo}
						placeholder="Ej: 5, Ana Torres o 10203040"
						value={termino}
						onChange={(event) => setTermino(event.target.value)}
					/>
					<button type="submit" className={styles.botonPrincipal} disabled={cargando}>
						<FiSearch /> {cargando ? "Buscando..." : "Buscar"}
					</button>
					<button type="button" className={styles.botonSecundario} onClick={exportarExcel}>
						<FiDownload /> Exportar Excel
					</button>
				</div>
			</form>

			<AlertMessage message={error} type="error" onClose={() => setError("")} />
			<AlertMessage message={mensaje} type="success" onClose={() => setMensaje("")} />

			<div className={styles.tablaWrapper}>
				<table className={styles.tabla}>
					<thead>
						<tr>
							<th>ID</th>
							<th>Nombres</th>
							<th>Documento</th>
							<th>Correo</th>
							<th>Rol</th>
							<th>Estado</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{usuarios.length ? (
							usuarios.map((usuario) => (
								<tr key={usuario.id}>
									<td>{usuario.id}</td>
									<td>{usuario.nombre}</td>
									<td>{usuario.numero_documento}</td>
									<td>{usuario.email}</td>
									<td>{usuario.rol}</td>
									<td>{usuario.estado}</td>
									<td>
										<div className={styles.accionesTabla}>
											<button
												type="button"
												className={styles.botonIcono}
												onClick={() => abrirModalEdicion(usuario)}
												aria-label="Editar usuario"
											>
												<FiEdit2 />
											</button>
											<button
												type="button"
												className={`${styles.botonIcono} ${styles.botonPeligro}`}
												onClick={() => manejarEliminar(usuario)}
												aria-label="Eliminar usuario"
											>
												<FiTrash2 />
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={7} className={styles.sinResultados}>
									No hay usuarios para mostrar.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{modalAbierto ? (
				<div className={styles.fondoModal}>
					<div className={styles.modal}>
						<h3 className={styles.tituloModal}>Editar Usuario</h3>
						<form className={styles.formularioModal} onSubmit={guardarEdicion}>
							<label className={styles.label} htmlFor="nombreUsuarioEditar">
								Nombres
							</label>
							<input
								id="nombreUsuarioEditar"
								name="nombre"
								type="text"
								className={styles.campo}
								value={formulario.nombre}
								onChange={manejarCambio}
								required
							/>

							<label className={styles.label} htmlFor="tipoDocumentoEditar">
								Tipo de documento
							</label>
							<select
								id="tipoDocumentoEditar"
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

							<label className={styles.label} htmlFor="numeroDocumentoEditar">
								Numero de documento
							</label>
							<input
								id="numeroDocumentoEditar"
								name="numeroDocumento"
								type="text"
								className={styles.campo}
								value={formulario.numeroDocumento}
								onChange={manejarCambio}
								required
							/>

							<label className={styles.label} htmlFor="emailEditar">
								Correo
							</label>
							<input
								id="emailEditar"
								name="email"
								type="email"
								className={styles.campo}
								value={formulario.email}
								onChange={manejarCambio}
								required
							/>

							<label className={styles.label} htmlFor="passwordEditar">
								Contraseña (opcional)
							</label>
							<div className={styles.campoPassword}>
								<input
									id="passwordEditar"
									name="password"
									type={mostrarPassword ? "text" : "password"}
									className={styles.campo}
									value={formulario.password}
									onChange={manejarCambio}
									placeholder="Deja en blanco para conservar la actual"
								/>
								<button
									type="button"
									className={styles.botonOjo}
									onClick={() => setMostrarPassword((valor) => !valor)}
									aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
								>
									{mostrarPassword ? <FiEyeOff /> : <FiEye />}
								</button>
							</div>

							<label className={styles.label} htmlFor="rolEditar">
								Rol
							</label>
							<select
								id="rolEditar"
								name="rol"
								className={styles.campo}
								value={formulario.rol}
								onChange={manejarCambio}
								required
							>
								<option value="usuario">Usuario</option>
								<option value="administrador">Administrador</option>
							</select>

							<label className={styles.label} htmlFor="estadoEditar">
								Estado
							</label>
							<select
								id="estadoEditar"
								name="estado"
								className={styles.campo}
								value={formulario.estado}
								onChange={manejarCambio}
								required
							>
								<option value="activo">Activo</option>
								<option value="inactivo">Inactivo</option>
							</select>

							<div className={styles.accionesModal}>
								<button type="button" className={styles.botonSecundario} onClick={cerrarModal}>
									Cancelar
								</button>
								<button type="submit" className={styles.botonPrincipal}>
									Guardar cambios
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}

			<ConfirmModal
				open={Boolean(usuarioPendienteEliminar)}
				title="¿Estas seguro de eliminar este usuario?"
				description={
					usuarioPendienteEliminar
						? `Se eliminará el usuario ${usuarioPendienteEliminar.nombre}. Esta acción no se puede deshacer.`
						: ""
				}
				onCancel={() => setUsuarioPendienteEliminar(null)}
				onConfirm={confirmarEliminar}
				confirmText="Confirmar"
				cancelText="Cancelar"
			/>
		</section>
	);
}

export default GestionarUsuarios;
