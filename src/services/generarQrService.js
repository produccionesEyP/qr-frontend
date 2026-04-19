const API_URL = "qrcodex.up.railway.app";

export const buscarColaboradoresParaQr = async (termino) => {
	const response = await fetch(
		`${API_URL}/api/colaboradores/qr/buscar?termino=${encodeURIComponent(termino)}`
	);

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible buscar colaboradores para QR.");
	}

	return data;
};
