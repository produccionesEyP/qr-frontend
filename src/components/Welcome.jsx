import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiQrCodeLine, RiCheckDoubleFill } from "react-icons/ri";
import styles from "../styles/Welcome.module.css";
import { getAuthUser } from "../services/sessionService";

function Welcome() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [redireccionando, setRedireccionando] = useState(false);

  useEffect(() => {
    const usuarioActual = getAuthUser();

    if (usuarioActual) {
      setUsuario(usuarioActual);
    }

    // Temporizador para redirigir después de 3.5 segundos
    const temporizador = setTimeout(() => {
      setRedireccionando(true);
      const usuarioData = getAuthUser();

      // Redirigir según el rol del usuario
      if (usuarioData?.rol === "administrador") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    }, 10000); // 10 segundos para que el usuario vea la pantalla de bienvenida

    return () => clearTimeout(temporizador);
  }, [navigate]);

  return (
    <main className={styles.contenedor}>
      {/* Fondo animado con gradiente */}
      <div className={styles.fondoAnimado} />

      {/* Contenedor principal de bienvenida */}
      <div className={styles.contenedorWelcome}>
        {/* Icono animado QR */}
        <div className={styles.iconoContenedor}>
          <RiQrCodeLine className={styles.qrIcono} />
          <div className={styles.pulso} />
        </div>

        {/* Texto de bienvenida */}
        <div className={styles.textoPrincipal}>
          <h1 className={styles.titulo}>¡Bienvenido!</h1>
          {usuario && (
            <p className={styles.subtitulo}>
              Hola, <span className={styles.nombre}>{usuario.nombre}</span>
            </p>
          )}
        </div>

        {/* Check animado */}
        <div className={styles.checkContenedor}>
          <RiCheckDoubleFill className={styles.checkIcon} />
          <p className={styles.mensaje}>Sesión iniciada correctamente</p>
        </div>

        {/* Indicador de carga */}
        <div className={styles.indicadorCarga}>
          <div className={styles.barraProgreso} />
        </div>

        {/* Texto de redirección */}
        <p className={styles.textoRedireccion}>
          {redireccionando ? "Redirigiendo..." : "Te llevaremos a tu panel en un momento"}
        </p>
      </div>

      {/* Partículas animadas de fondo */}
      <div className={styles.particulasContenedor}>
        <div className={styles.particula} style={{ "--delay": 0 }} />
        <div className={styles.particula} style={{ "--delay": 0.2 }} />
        <div className={styles.particula} style={{ "--delay": 0.4 }} />
        <div className={styles.particula} style={{ "--delay": 0.6 }} />
        <div className={styles.particula} style={{ "--delay": 0.8 }} />
      </div>
    </main>
  );
}

export default Welcome;
