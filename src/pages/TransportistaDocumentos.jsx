import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { datos, transportista } from '@/api';
import { useTranslation } from "react-i18next";
import "../styles/transportistaDocumentos.css";

export default function TransportistaDocumentos( { user } ) {
    const navigate = useNavigate();
    const { t } = useTranslation("transportista");
    const legajoTransportista = localStorage.getItem("legajo");

    const [transportistas, setTransportistas] = useState([]);
    const [documentos, setDocumentos] = useState([]);

    const [editandoId, setEditandoId] = useState(null);
    const [nuevaFecha, setNuevaFecha] = useState("");

    const [archivo, setArchivo] = useState(null);
    const [imagenBase64, setImagenBase64] = useState("");

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const base64Comprimido = await convertirYComprimirImagen(file, {
                maxWidth: 800,
                quality: 0.7
            });

            setArchivo(file);
            setImagenBase64(base64Comprimido);

            console.log("Tamaño base64:", base64Comprimido.length);

        } catch (error) {
            console.error(error);
        }
    };

    const convertirYComprimirImagen = (file, options = {}) => {
        return new Promise((resolve, reject) => {
            if (!file) return reject("No hay archivo");

            const {
                maxWidth = 800,
                quality = 0.7,
                mimeType = "image/jpeg"
            } = options;

            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onload = () => {
                const img = new Image();
                img.src = reader.result;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    // Escalado proporcional
                    const scale = Math.min(1, maxWidth / img.width);
                    const width = img.width * scale;
                    const height = img.height * scale;

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    // 👇 devuelve base64 completo (con data:image/jpeg;base64,...)
                    const base64 = canvas.toDataURL(mimeType, quality);

                    resolve(base64);
                };

                img.onerror = (err) => reject("Error cargando imagen");
            };

            reader.onerror = (err) => reject("Error leyendo archivo");
        });
    };

    const escanearDocumento = async (doc) => {
        try {
            const formData = new FormData();
            formData.append("base64Image", imagenBase64);
            formData.append("documentType", doc.tipoDocumentoNombre);

            const res = await transportista.escanearDocumento(formData);

            console.log("Respuesta backend:", res);

            const fechaVencimiento = res.parsedPayload.vencimiento;

            await transportista.actualizarDocumento(doc.id, {
                fechaVencimiento: fechaVencimiento
            });

            setDocumentos(prev =>
                prev.map(d =>
                    d.id === doc.id
                        ? { ...d, fechaVencimiento: fechaVencimiento }
                        : d
                )
            );

            setEditandoId(null);
            setArchivo(null);
            setImagenBase64("");

        } catch (error) {
            console.error("Error al escanear documento:", error);
        }
    };
        

    return (
        <main className="transportista-screen">
            <section className="transportista-content">
                <div className="documentos-header">
                    <h1>{t("documents.title")}</h1>
                    <p>{t("documents.subtitle")}</p>
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
                                            <strong>{t("details.expiration")}:</strong> {doc.fechaVencimiento}
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
                                        {t("documents.seeDocument")}
                                    </a>
                                </div>

                                {/* 👇 EDITOR AHORA AFUERA */}
                                <div
                                    className={`editor-externo ${
                                        editandoId === doc.id ? "visible" : "oculto"
                                    }`}
                                >
                                    <label className="input-file">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <span>{t("documents.selectImage")}</span>
                                    </label>

                                    <button 
                                        className="btn-actualizar"
                                        onClick={() => escanearDocumento(doc)}
                                        disabled={!imagenBase64}
                                    >
                                        {t("documents.updateDocument")}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}