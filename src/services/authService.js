const API_URL = "qrcodex.up.railway.app"

const parsearRespuesta = async (response) => {
  const contentType = String(response.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const texto = await response.text();

  if (texto.trim().startsWith("<!DOCTYPE") || texto.trim().startsWith("<html")) {
    throw new Error("La API no esta respondiendo en JSON. Verifica REACT_APP_API_URL y el puerto del backend.");
  }

  throw new Error(texto || "Respuesta inesperada del servidor.");
};

export const login = async ({ email, password }) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await parsearRespuesta(response);

  if (!response.ok) {
    throw new Error(data.message || "No fue posible iniciar sesión.");
  }

  return data;
};

export const register = async (payload) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parsearRespuesta(response);

  if (!response.ok) {
    throw new Error(data.message || "No fue posible registrar el usuario.");
  }

  return data;
};
