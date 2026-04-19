import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../services/sessionService";

/**
 * Componente ProtectedRoute para proteger rutas que requieren autenticación
 * @param {React.ReactNode} element - El componente a renderizar si el usuario está autenticado
 * @param {string} rolesRequeridos - El rol requerido para acceder (ej: "administrador", "usuario")
 * @returns {React.ReactNode} El componente protegidev o redirección al login
 */
function ProtectedRoute({ element, rolesRequeridos = null }) {
  const token = getAuthToken();
  const usuario = getAuthUser();

  // Si no hay token, redirigir al login
  if (!token || !usuario) {
    return <Navigate to="/" replace />;
  }

  // Si se especifican roles, validar que el usuario tenga uno de los roles permitidos
  if (rolesRequeridos) {
    const rolesArray = Array.isArray(rolesRequeridos) ? rolesRequeridos : [rolesRequeridos];

    if (!rolesArray.includes(usuario.rol)) {
      // Redirigir al dashboard correspondiente del usuario
      if (usuario.rol === "administrador") {
        return <Navigate to="/admin-dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  // Si todo está bien, renderizar el componente
  return element;
}

export default ProtectedRoute;
