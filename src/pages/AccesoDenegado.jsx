import { useNavigate } from "react-router-dom";
import React from "react";
import "../styles/accesoDenegado.css";

//Modificar la pantalla para que sea mas grande y ver que tipo de informacion
//puedo agregar, como por ejemplo un mensaje personalizado o un enlace a la pagina de inicio.
//Esta pagina quedaria como PLACEHOLDER para ver si funciona el sistema de permisos.

const AccesoDenegado = () => {
  const navigate = useNavigate();

  return (
    <div className="denegado-layout">
      <div className="acceso-denegado">
        <h2 className="denegado-titulo">⛔ Acceso denegado</h2>
        
        <p className="denegado-texto">
          No tenés permisos para acceder a esta sección.
        </p>

        <button
          className="denegado-boton"
          onClick={() => navigate("/dashboard")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default AccesoDenegado;
