const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const crearColaborador = async (formData) => {
	const response = await fetch(`${API_URL}/api/colaboradores`, {
		method: "POST",
		body: formData,
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible registrar el colaborador.");
	}

	return data;
};

export const obtenerColaboradorPorId = async (idColaborador) => {
	const response = await fetch(`${API_URL}/api/colaboradores/${idColaborador}`);

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible consultar el colaborador.");
	}

	return data;
};