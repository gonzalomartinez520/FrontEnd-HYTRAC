
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
                        <h2>Nuevas órdenes</h2>
                        <p>
                            Validación de órdenes entrantes al sistema
                        </p>
                    </div>

                    <div className="cambios-estado" onClick={() => navigate("/confirmar-cambio-estado")}>
                        <h2>Inicio de viajes</h2>
                        <p>
                            Confirmación para que el transportista inicie el viaje
                        </p>
                    </div>

                    <div className="entregas" onClick={() => navigate("/confirmar-entregas")}>
                        <h2>Entregas</h2>
                        <p>
                            Verificación de entregas completadas
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}