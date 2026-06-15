import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { datos } from '@/api';
import "../styles/transportistaDocumentos.css";

export default function TransportistaDocumentos( { user } ) {
    const navigate = useNavigate();
    const legajoTransportista = localStorage.getItem("legajo");

    const [transportistas, setTransportistas] = useState([]);
    const [documentos, setDocumentos] = useState([]);

    const [editandoId, setEditandoId] = useState(null);
    const [nuevaFecha, setNuevaFecha] = useState("");

    useEffect(() => {
        const fetchTransportistas = async () => {
            try {
                const res = await datos.getTransportistas();
                setTransportistas(res);
            } catch (error) {
                console.error("Error al traer transportistas:", error);
            }
        };

        fetchTransportistas();
    }, []);

    useEffect(() => {
        const fetchDocumentos = async () => {
            if (transportistas.length === 0) return;

            // Buscar transportista por legajo
            const transportista = transportistas.find(
                (t) => t.legajo == legajoTransportista
            );

            if (!transportista) {
                console.warn("No se encontró transportista con ese legajo");
                return;
            }

            try {
                const docs = await datos.getDocumentos(transportista.id);
                setDocumentos(docs);
            } catch (error) {
                console.error("Error al traer documentos:", error);
            }
        };

        fetchDocumentos();
    }, [transportistas, legajoTransportista]);

    const getEstadoDocumento = (fechaVencimiento) => {
        const hoy = new Date();
        const venc = new Date(fechaVencimiento);

        const diffDias = (venc - hoy) / (1000 * 60 * 60 * 24);

        if (diffDias < 0) return "vencido";
        if (diffDias <= 30) return "porVencer";
        return "vigente";
    };

    const puedeEditar = (fechaVencimiento) => {
        const hoy = new Date();
        const venc = new Date(fechaVencimiento);

        const diffDias = (venc - hoy) / (1000 * 60 * 60 * 24);

        return diffDias <= 30;
    };

    const documentosOrdenados = [...documentos].sort(
        (a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
    );
    

    return (
        <main className="transportista-screen">
            <section className="transportista-content">
                <div className="documentos-header">
                    <h1>Documentos</h1>
                    <p>Aquí podrá visualizar sus documentos ingresados al sistema y gestionarlos</p>
                </div>

                <div className="documentos">
                    {documentosOrdenados.map((doc, index) => {
                        const estado = getEstadoDocumento(doc.fechaVencimiento);
                        const habilitado = puedeEditar(doc.fechaVencimiento);

                        return (
                            <div className="documento-wrapper" key={doc.id}>
    
                                {/* CARD */}
                                <div
                                    className={`documento-card ${estado} ${editandoId === doc.id ? "activa" : ""}`}
                                    style={{ animationDelay: `${Math.floor(index / 3) * 0.2}s` }}
                                >
                                    <h3>{doc.tipoDocumentoNombre}</h3>

                                    <p><strong>Nro:</strong> {doc.nroDocumento}</p>

                                    <div className="fecha-row">
                                        <p>
                                            <strong>Vencimiento:</strong> {doc.fechaVencimiento}
                                        </p>

                                        <button
                                            disabled={!habilitado}
                                            onClick={() =>
                                                setEditandoId(editandoId === doc.id ? null : doc.id)
                                            }
                                            className="btn-editar"
                                        >
                                                <svg viewBox="0 0 24 24" width="22" height="22">
                                                    <path
                                                        d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5a5 5 0 1 1-9.9-1h-2.02A7 7 0 1 0 12 6z"
                                                        fill="#f39c12"
                                                    />
                                                </svg>
                                        </button>
                                    </div>

                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        Ver documento
                                    </a>
                                </div>

                                {/* EDITOR DEBAJO */}
                                <div className={`editor-wrapper ${editandoId === doc.id ? "open" : ""}`}>
                                    <div className="editar-fecha">
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split("T")[0]}
                                            value={nuevaFecha}
                                            onChange={(e) => setNuevaFecha(e.target.value)}
                                        />

                                        <button
                                            disabled={!habilitado || !nuevaFecha}
                                            onClick={() => actualizarFecha(doc.id)}
                                        >
                                            ✔
                                        </button>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}