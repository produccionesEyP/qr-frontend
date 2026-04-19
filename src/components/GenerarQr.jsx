import React, { useMemo, useState } from "react";
import QRCode from "qrcode";
import { FiPrinter, FiSearch, FiUser } from "react-icons/fi";
import styles from "../styles/GenerarQr.module.css";
import { buscarColaboradoresParaQr } from "../services/generarQrService";
import AlertMessage from "./AlertMessage";

function GenerarQr({ embebido = false } = {}) {
	const [termino, setTermino] = useState("");
	const [resultados, setResultados] = useState([]);
	const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(null);
	const [qrDataUrl, setQrDataUrl] = useState("");
	const [cargando, setCargando] = useState(false);
	const [error, setError] = useState("");
	const [mensaje, setMensaje] = useState("");

	const titulo = useMemo(() => {
		if (!colaboradorSeleccionado) {
			return "Reimpresion de QR";
		}

		return `${colaboradorSeleccionado.nombres} ${colaboradorSeleccionado.apellidos}`;
	}, [colaboradorSeleccionado]);

	const manejarBusqueda = async (event) => {
		event.preventDefault();
		setError("");
		setMensaje("");
		setQrDataUrl("");
		setColaboradorSeleccionado(null);
		setCargando(true);

		try {
			const respuesta = await buscarColaboradoresParaQr(termino);
			const encontrados = respuesta.colaboradores || [];
			setResultados(encontrados);

			if (!encontrados.length) {
				setMensaje("No se encontraron colaboradores con ese criterio.");
			}
		} catch (errorBusqueda) {
			setResultados([]);
			setError(errorBusqueda.message || "No fue posible consultar colaboradores.");
		} finally {
			setCargando(false);
		}
	};

	const seleccionarColaborador = async (colaborador) => {
		setError("");
		setMensaje("");
		setQrDataUrl("");
		setColaboradorSeleccionado(colaborador);

		try {
			const dataUrl = await QRCode.toDataURL(colaborador.qr_url, {
				width: 280,
				margin: 1,
				errorCorrectionLevel: "M",
				color: {
					dark: "#000000",
					light: "#ffffff",
				},
			});

			setQrDataUrl(dataUrl);
		} catch (_errorQr) {
			setError("No fue posible generar el codigo QR.");
		}
	};

	const manejarImpresion = () => {
		window.print();
	};

	return (
		<section className={`${styles.pagina} ${embebido ? styles.embebido : ""}`}>
			<div className={styles.cabecera}>
				<p className={styles.etiqueta}>Modulo de reimpresion</p>
				<h2 className={styles.titulo}>{titulo}</h2>
			</div>

			<form className={styles.buscador} onSubmit={manejarBusqueda}>
				<label className={styles.label} htmlFor="terminoQr">
					Buscar por ID, nombre o cedula
				</label>
				<div className={styles.filaBusqueda}>
					<input
						id="terminoQr"
						type="text"
						className={styles.campo}
						value={termino}
						onChange={(event) => setTermino(event.target.value)}
						placeholder="Ej: 12, Juan Perez o 123456789"
						required
					/>
					<button type="submit" className={styles.botonPrincipal} disabled={cargando}>
						<FiSearch /> {cargando ? "Buscando..." : "Buscar"}
					</button>
				</div>
			</form>

			<AlertMessage message={error} type="error" onClose={() => setError("")} />
			<AlertMessage message={mensaje} type="success" onClose={() => setMensaje("")} />

			<div className={styles.contenido}>
				<aside className={styles.panelResultados}>
					<h3 className={styles.subtitulo}>Resultados</h3>
					<div className={styles.listaResultados}>
						{resultados.length ? (
							resultados.map((colaborador) => (
								<button
									key={colaborador.id_colaborador}
									type="button"
									className={styles.itemResultado}
									onClick={() => seleccionarColaborador(colaborador)}
								>
									<FiUser className={styles.icono} />
									<div>
										<strong>
											{colaborador.nombres} {colaborador.apellidos}
										</strong>
										<p>
											ID: {colaborador.id_colaborador} | Cedula: {colaborador.numero_documento}
										</p>
									</div>
								</button>
							))
						) : (
							<p className={styles.textoVacio}>Busca un colaborador para ver su QR.</p>
						)}
					</div>
				</aside>

				<section className={styles.panelQr}>
					<h3 className={styles.subtitulo}>QR para reimprimir</h3>
					{colaboradorSeleccionado ? (
						<div className={styles.resumen}>
							<p>
								<strong>Nombre:</strong> {colaboradorSeleccionado.nombres} {colaboradorSeleccionado.apellidos}
							</p>
							<p>
								<strong>ID:</strong> {colaboradorSeleccionado.id_colaborador}
							</p>
							<p>
								<strong>Cedula:</strong> {colaboradorSeleccionado.numero_documento}
							</p>
						</div>
					) : null}

					<div className={styles.zonaQr}>
						{qrDataUrl ? (
							<img src={qrDataUrl} alt="QR del colaborador" className={styles.imagenQr} />
						) : (
							<p className={styles.textoVacio}>Selecciona un resultado para generar el QR.</p>
						)}
					</div>

					{qrDataUrl ? (
						<button type="button" className={styles.botonSecundario} onClick={manejarImpresion}>
							<FiPrinter /> Imprimir QR
						</button>
					) : null}
				</section>
			</div>
		</section>
	);
}

export default GenerarQr;
