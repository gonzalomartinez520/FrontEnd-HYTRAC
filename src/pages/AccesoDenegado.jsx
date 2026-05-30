import { useNavigate } from "react-router-dom";
import React from "react";
import "../styles/accesoDenegado.css";

export default function  AccesoDenegado  ( { user } ) {
  const navigate = useNavigate();
  const role = String(user?.role || user?.normalizedRole || user?.rol || "")
  .toUpperCase()
  .replace("ROLE_", "")
  .replace(" ", "_");

  return (
    <div className="denegado-layout">
      <div className="acceso-denegado">
        <h2 className="denegado-titulo">⛔ Acceso denegado</h2>
        
        <p className="denegado-texto">
          No tenés permisos para acceder a esta sección.
        </p>

        <div
          className="back-link"
          onClick={() => {
            console.log("ROLE:", role);
            console.log(user);

            const route =
              role === "JEFE_ESTACION"
                ? "/jefe-estacion"
                : role === "TRANSPORTISTA"
                ? "/transportista"
                : role === "ADMIN"
                ? "/administrador"
                : "/dashboard";

            console.log("NAVIGATE TO:", route);

            navigate(route);
          }}
        >
          ← Volver al Panel
        </div>
      </div>
    </div>
  );
};
