import { useState, useEffect } from "react";
import "../styles/reportes.css";

export default function Reportes({ user }) {
    const [loading, setLoading] = useState(true);

    //VER COMO SE RECIBEN O ARMAN LOS REPORTES


    if (loading) {
        return (
        <div className="reportes-loading-screen">
            <div className="reportes-loader"></div>
            <h2>Cargando reportes...</h2>
        </div>
        );
    }

    return (
        <div className="reportes-layout">

        {/* ACA SE RENDERIZAN LOS GRAFICOS DE CADA REPORTE CON OPCION DE EXPORTAR EN CSV */}


        </div>
    );
}