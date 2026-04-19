import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import styles from "../styles/VistaPublicaColaborador.module.css";
import { obtenerColaborador } from "../services/perfilColaboradorService";
import AlertMessage from "./AlertMessage";

function VistaPublicaColaborador() {
	const { idColaborador } = useParams();
	const [colaborador, setColaborador] = useState(null);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const cargarColaborador = async () => {
			setCargando(true);
			setError("");

			try {
				const respuesta = await obtenerColaborador(idColaborador);
				setColaborador(respuesta.colaborador || null);
			} catch (errorConsulta) {
				setError(errorConsulta.message || "No fue posible cargar la vista pública.");
			} finally {
				setCargando(false);
			}
		};

		cargarColaborador();
	}, [idColaborador]);

	return (
		<main className={styles.pagina}>
			<div className={styles.fondo} aria-hidden="true" />

			<section className={styles.tarjetaPrincipal}>
				<div className={styles.encabezado}>
					<div>
						<h1 className={styles.titulo}>Perfil del colaborador</h1>
					</div>

					<Link className={styles.cerrar} to="/">
						Cerrar
					</Link>
				</div>

				{cargando ? <p className={styles.estado}>Cargando información...</p> : null}
				<AlertMessage message={error} type="error" onClose={() => setError("")} />

				{colaborador ? (
					<div className={styles.contenido}>
						<div className={styles.fotoContenedor}>
							{colaborador.foto_perfil_url ? (
								<img
									src={colaborador.foto_perfil_url}
									alt={`${colaborador.nombres} ${colaborador.apellidos}`}
									className={styles.foto}
								/>
							) : (
								<div className={styles.fotoVacia}>Sin foto</div>
							)}
						</div>

						<div className={styles.detalles}>
							<div className={styles.campoDato}>
								<span className={styles.label}><FiUser /> Nombre completo</span>
								<strong>{colaborador.nombres} {colaborador.apellidos}</strong>
							</div>

							<div className={styles.campoDato}>
								<span className={styles.label}>Cédula</span>
								<strong>{colaborador.numero_documento}</strong>
							</div>

							<div className={styles.campoDato}>
								<span className={styles.label}>Cargo</span>
								<strong>{colaborador.cargo}</strong>
							</div>

							<div className={styles.campoDato}>
								<span className={styles.label}>Grupo sanguineo</span>
								<strong>{colaborador.grupo_sanguineo || "-"}</strong>
							</div>

							<div className={styles.campoDato}>
								<span className={styles.label}><FiMapPin /> Área</span>
								<strong>{colaborador.area}</strong>
							</div>

							<div className={styles.campoDato}>
								<span className={styles.label}><FiPhone /> Celular</span>
								<strong>{colaborador.celular || "-"}</strong>
							</div>

							<div className={styles.campoDato}>
								<span className={styles.label}>Dirección</span>
								<strong>{colaborador.direccion || "-"}</strong>
							</div>

							<div className={styles.campoDato}>
								<span className={styles.label}>Sede</span>
								<strong>{colaborador.sede || "-"}</strong>
							</div>
						</div>
					</div>
				) : null}
			</section>
		</main>
	);
}

export default VistaPublicaColaborador;