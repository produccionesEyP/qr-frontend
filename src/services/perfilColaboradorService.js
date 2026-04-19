const API_URL = "qrcodex.up.railway.app";

export const buscarColaboradores = async (termino) => {
	const response = await fetch(
		`${API_URL}/api/colaboradores/buscar?termino=${encodeURIComponent(termino)}`
	);

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible buscar colaboradores.");
	}

	return data;
};

export const obtenerColaborador = async (idColaborador) => {
	const response = await fetch(`${API_URL}/api/colaboradores/${idColaborador}`);

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible consultar el colaborador.");
	}

	return data;
};

export const editarColaborador = async (idColaborador, formData) => {
	const response = await fetch(`${API_URL}/api/colaboradores/${idColaborador}`, {
		method: "PUT",
		body: formData,
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible editar el colaborador.");
	}

	return data;
};

export const retirarColaborador = async (idColaborador) => {
	const response = await fetch(`${API_URL}/api/colaboradores/${idColaborador}/retirar`, {
		method: "PATCH",
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible retirar el colaborador.");
	}

	return data;
};