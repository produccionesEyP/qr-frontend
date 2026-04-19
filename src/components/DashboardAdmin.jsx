import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { RiSparklingFill } from "react-icons/ri";
import styles from "../styles/DashboardUsuario.module.css";
import GenerarQr from "./GenerarQr";
import FormularioRegistro from "./FormularioRegisro";
import GestionarUsuarios from "./GestionarUsuarios";
import { clearAuthSession, getAuthToken, getAuthUser } from "../services/sessionService";

function DashboardAdmin() {
	const [menuAbierto, setMenuAbierto] = useState(false);
	const [seccionActiva, setSeccionActiva] = useState("inicio");
	const navigate = useNavigate();

	useEffect(() => {
		const token = getAuthToken();
		const usuario = getAuthUser();

		if (!token || !usuario) {
			navigate("/");
			return;
		}

		if (usuario.rol !== "administrador") {
			navigate("/dashboard");
		}
	}, [navigate]);

	const nombreUsuario = useMemo(() => {
		const usuario = getAuthUser();

		if (!usuario) {
			return "Administrador";
		}

		return usuario?.nombre || "Administrador";
	}, []);

	const alternarMenu = () => {
		setMenuAbierto((estadoActual) => !estadoActual);
	};

	const cerrarMenu = () => {
		setMenuAbierto(false);
	};

	const abrirSeccion = (seccion) => {
		cerrarMenu();
		setSeccionActiva(seccion);
	};

	const manejarCerrarSesion = () => {
		clearAuthSession();
			navigate("/");
	};

	return (
		<main className={styles.pagina}>
			<header className={styles.barraSuperior}>
				<div className={styles.contenidoBarra}>
					<button
						type="button"
						className={styles.botonHamburguesa}
						onClick={alternarMenu}
						aria-expanded={menuAbierto}
						aria-label={menuAbierto ? "Cerrar menu" : "Abrir menu"}
					>
						<span className={styles.lineaHamburguesa} />
						<span className={styles.lineaHamburguesa} />
						<span className={styles.lineaHamburguesa} />
					</button>

					<div className={styles.logoSoftware}>Codex</div>

					<div
						className={`${styles.overlayMenu} ${menuAbierto ? styles.overlayMenuActiva : ""}`}
						onClick={cerrarMenu}
						aria-hidden="true"
					/>

					<nav
						className={`${styles.navegacion} ${menuAbierto ? styles.navegacionActiva : ""}`}
						aria-label="Menu principal del dashboard"
					>
						<div className={styles.drawerHeader}>Codex</div>

						<ul className={styles.menuOpciones}>
							<li>
								<button
									type="button"
									className={styles.opcionMenu}
									onClick={() => abrirSeccion("registrarUsuario")}
								>
									Registrar usuario
								</button>
							</li>
							<li>
								<button
									type="button"
									className={styles.opcionMenu}
									onClick={() => abrirSeccion("gestionarUsuarios")}
								>
									Gestionar usuarios
								</button>
							</li>
							<li>
								<button
									type="button"
									className={styles.opcionMenu}
									onClick={() => abrirSeccion("qr")}
								>
									Generar QR
								</button>
							</li>
							<li className={styles.itemFinal}>
								<button type="button" className={styles.opcionMenu} onClick={cerrarMenu}>
									<FiChevronDown /> Admin: {nombreUsuario}
								</button>
							</li>
							<li className={styles.itemSesion}>
								<button type="button" className={styles.opcionCerrarSesion} onClick={manejarCerrarSesion}>
									Cerrar sesion
								</button>
							</li>
						</ul>
					</nav>
				</div>
			</header>

			<section
				className={`${styles.contenidoInicial} ${
					seccionActiva === "inicio" ? styles.contenidoInicialInicio : ""
				}`}
			>
				{seccionActiva === "inicio" ? (
					<div className={styles.bienvenidaPanel}>
						<div className={styles.iconoBienvenida} aria-hidden="true">
							<RiSparklingFill />
						</div>
						<h1 className={`${styles.titulo} ${styles.tituloBienvenida}`}>
							¡Bienvenido al panel Admin!
						</h1>
						<p className={`${styles.descripcion} ${styles.descripcionBienvenida}`}>
							Selecciona una opcion del menu superior para gestionar usuarios o generar QR.
						</p>
					</div>
				) : null}

				{seccionActiva === "registrarUsuario" ? <FormularioRegistro /> : null}
				{seccionActiva === "gestionarUsuarios" ? <GestionarUsuarios embebido /> : null}
				{seccionActiva === "qr" ? <GenerarQr embebido /> : null}
			</section>
		</main>
	);
}

export default DashboardAdmin;
