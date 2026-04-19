const API_URL = "qrcodex.up.railway.app";

export const listarUsuarios = async (termino = "") => {
	const url = `${API_URL}/api/auth/users${
		termino ? `?termino=${encodeURIComponent(termino)}` : ""
	}`;
	const response = await fetch(url);
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible consultar usuarios.");
	}

	return data;
};

export const actualizarUsuario = async (idUsuario, payload) => {
	const response = await fetch(`${API_URL}/api/auth/users/${idUsuario}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible actualizar el usuario.");
	}

	return data;
};

export const eliminarUsuario = async (idUsuario) => {
	const response = await fetch(`${API_URL}/api/auth/users/${idUsuario}`, {
		method: "DELETE",
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "No fue posible eliminar el usuario.");
	}

	return data;
};
