import React from "react"; 
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import InicioSesion from  './components/Login.jsx';
import FormularioRegistro from './components/FormularioRegisro.jsx';
import Welcome from './components/Welcome.jsx';
import DashboardUsuario from './components/DashboardUsuario.jsx';
import DashboardAdmin from './components/DashboardAdmin.jsx';
import IngresarColaborador from './components/IngresarColaborador.jsx';
import PerfilColaborador from './components/PerfilColaborador.jsx';
import VistaPublicaColaborador from './components/VistaPublicaColaborador.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<InicioSesion />} />
        <Route path="/registro" element={<FormularioRegistro />} />
        
        {/* Ruta Welcome (después del login) */}
        <Route 
          path="/welcome" 
          element={<ProtectedRoute element={<Welcome />} />} 
        />

        {/* Rutas protegidas del usuario regular */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute element={<DashboardUsuario />} rolesRequeridos="usuario" />} 
        />

        {/* Rutas protegidas del administrador */}
        <Route 
          path="/admin-dashboard" 
          element={<ProtectedRoute element={<DashboardAdmin />} rolesRequeridos="administrador" />} 
        />

        {/* Rutas anidadas para colaboradores (si es necesario) */}
        <Route 
          path="/ingresar-colaborador" 
          element={<ProtectedRoute element={<IngresarColaborador />} />} 
        />
        <Route 
          path="/perfil-colaborador" 
          element={<ProtectedRoute element={<PerfilColaborador />} />} 
        />

        {/* Vista pública accesible desde el QR */}
        <Route
          path="/colaborador/:idColaborador"
          element={<VistaPublicaColaborador />}
        />

        {/* Ruta fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

