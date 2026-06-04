import { useNavigate } from "react-router-dom";
import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/accesoDenegado.css";

export default function  AccesoDenegado  ( { user } ) {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const role = String(user?.role || user?.normalizedRole || user?.rol || "")
  .toUpperCase()
  .replace("ROLE_", "")
  .replace(" ", "_");

  return (
    <div className="denegado-layout">
      <div className="acceso-denegado">
        <h2 className="denegado-titulo">⛔ {t('common.accesoDenegado')}</h2>
        
        <p className="denegado-texto">
          {t('common.noTienePermisos')}
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
          ← {t('common.volverAlInicio')}
        </div>
      </div>
    </div>
  );
};
