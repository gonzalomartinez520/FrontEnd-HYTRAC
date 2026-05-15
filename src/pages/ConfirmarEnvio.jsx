import { data, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { envios } from '@/api';

export default function ConfirmarEnvio({ user }) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [shipments, setShipments] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          const response = await envios.getAll();
          console.log("Datos obtenidos de la API:", response);
          setShipments(response);
        } catch (error) {
          console.error("Error al obtener envíos:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString);

        return fecha.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const filteredShipments = shipments.filter((shipment) => {
        const searchText = (search || "").toLowerCase();

        const fields = [
        shipment.plantaDespachoNombre,
        shipment.estacionDestinoNombre,
        shipment.transportistaNombre,
        ];

        return (
        String(shipment.id).includes(searchText) ||
        fields.some(field =>
            (field || "").toLowerCase().includes(searchText)
        )
        );
    });


    if (loading) {
        return (
        <div className="loading-screen">
            <div className="loader"></div>
            <h2>Cargando panel HYTRAC...</h2>
        </div>
        );
    }


    return (
        <div className="confirmar-envio-container">
            <main className="dashboard-content">
                <section className="header">
                    <h1>Confirmar Envío</h1>
                    <p>
                        Aquí podrás confirmar los envíos que has realizado. Revisa los detalles de cada envío y confirma su estado para mantener el sistema actualizado.
                    </p>
                </section>

                <section className="shipments-table">
                    <div className="table-header">
                        <div>
                            <h2>Órdenes pendientes: {shipments.length}</h2>
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Buscar por ID, planta, destino o transportista..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Planta de Despacho</th>
                                <th>Estación Destino</th>
                                <th>Transportista</th>
                                <th>Fecha de Envío</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShipments.map((shipment) => (
                                <tr key={shipment.id}>
                                    <td>{shipment.id}</td>
                                    <td>{shipment.plantaDespachoNombre}</td>
                                    <td>{shipment.estacionDestinoNombre}</td>
                                    <td>{shipment.transportistaNombre}</td>
                                    <td>{formatearFecha(shipment.fechaEnvio)}</td>
                                    <td>{shipment.estado}</td>
                                    <td>
                                        <button onClick={() => handleConfirmarEnvio(shipment.id)}>
                                            Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
}