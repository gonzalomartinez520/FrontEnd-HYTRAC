
import { useNavigate } from "react-router-dom";
import "../styles/confirmaciones.css";

export default function Confirmaciones( { user } ) {
    const navigate = useNavigate();

    return (
        <div className="confirmaciones-layout">

            <main className="confirmaciones-content">
                <section className="confirmaciones-header">
                    <div>
                        <h1>Confirmaciones</h1>
                        <p>
                            Por favor, seleccione una de las opciones.
                        </p>
                    </div>
                </section>
                {/* LUEGO AGREGAR UNA IMAGEN EN CADA CARD PARA REPRESENTARLOS*/}
                <section className="confirmaciones-card">
                    <div className="pendientes" onClick={() => navigate("/confirmar-envio")}>
                        <h2>Pendientes</h2>
                        <p>
                            Validación de nuevas órdenes
                        </p>
                    </div>

                    <div className="ediciones" onClick={() => navigate("/confirmar-edicion")}>
                        <h2>Ediciones</h2>
                        <p>
                            Validación de órdenes editadas
                        </p>
                    </div>

                    <div className="cambios-estado" onClick={() => navigate("/confirmar-cambio-estado")}>
                        <h2>Cambios de estado</h2>
                        <p>
                            Validación de cambios de estado
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}