import React, { useMemo, useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { RiSparklingFill } from "react-icons/ri";
import IngresarColaborador from "./IngresarColaborador.jsx";
import PerfilColaborador from "./PerfilColaborador.jsx";
import GenerarQr from "./GenerarQr.jsx";
import { useNavigate } from "react-router-dom";
import styles from "../styles/DashboardUsuario.module.css";
import { clearAuthSession, getAuthToken, getAuthUser } from "../services/sessionService";

function DashboardUsuario() {
	const [menuAbierto, setMenuAbierto] = useState(false);
	const [seccionActiva, setSeccionActiva] = useState("inicio");
	const navigate = useNavigate();

	// Verificar autenticación y rol del usuario
	useEffect(() => {
		const token = getAuthToken();
		const usuario = getAuthUser();

		if (!token || !usuario) {
			navigate("/");
			return;
		}

		// Si es administrador, redirigir al dashboard admin
		if (usuario.rol === "administrador") {
			navigate("/admin-dashboard");
		}
	}, [navigate]);

	const nombreUsuario = useMemo(() => {
		const usuario = getAuthUser();

		if (!usuario) {
			return "Usuario";
		}

		return usuario?.nombre || "Usuario";
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
									onClick={() => abrirSeccion("ingresar")}
								>
									Ingresar colaborador
								</button>
							</li>
							<li>
								<button
									type="button"
									className={styles.opcionMenu}
									onClick={() => abrirSeccion("perfil")}
								>
									Perfil colaborador
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
									<FiChevronDown /> Usuario: {nombreUsuario}
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
							¡Bienvenido a Codex!
						</h1>
						<p className={`${styles.descripcion} ${styles.descripcionBienvenida}`}>
							Comienza ahora: selecciona una opcion del menu superior.
						</p>
					</div>
				) : null}

				{seccionActiva === "ingresar" ? <IngresarColaborador embebido /> : null}
				{seccionActiva === "perfil" ? <PerfilColaborador embebido /> : null}
				{seccionActiva === "qr" ? <GenerarQr embebido /> : null}
			</section>
		</main>
	);
}

export default DashboardUsuario;
