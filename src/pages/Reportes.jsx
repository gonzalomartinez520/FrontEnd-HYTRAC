import { useState, useEffect } from "react";
import * as FileSaver from 'file-saver';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

import "../styles/reportes.css";

import { envios , datos } from "@/api";

export default function Reportes({ user }) {
  const [loading, setLoading] = useState(true);

  const [enviosData, setEnviosData] = useState([]);
  const [incidenciasData, setIncidenciasData] = useState([]);


const totalEnvios = enviosData.length;





const obtenerEstadoReal = (envio) => {

  if (!envio.confirmado) {
    return "Pendiente de confirmación";
  }

  if (
    envio.confirmado &&
    envio.estado === "Pendiente"
  ) {
    return "Pendiente de inicio de viaje";
  }

  if (
    envio.estado === "En Curso"
  ) {
    return "En Curso";
  }

  if (
    envio.estado ===
    "Pendiente de confirmacion de entrega"
  ) {
    return "Pendiente de confirmación de entrega";
  }

  if (
    envio.estado === "Entregada"
  ) {
    return "Entregada";
  }

  if (
    envio.estado === "Cancelada"
  ) {
    return "Cancelada";
  }

  return "Otro";
};

const estadosContador = {
  pendienteConfirmacion: 0,
  pendienteInicio: 0,
  enCurso: 0,
  pendienteEntrega: 0,
  entregada: 0,
  cancelada: 0
};

enviosData.forEach((envio) => {

  const estadoReal =
    obtenerEstadoReal(envio);

  switch (estadoReal) {

    case "Pendiente de confirmación":
      estadosContador.pendienteConfirmacion++;
      break;

    case "Pendiente de inicio de viaje":
      estadosContador.pendienteInicio++;
      break;

    case "En Curso":
      estadosContador.enCurso++;
      break;

    case "Pendiente de confirmación de entrega":
      estadosContador.pendienteEntrega++;
      break;

    case "Entregada":
      estadosContador.entregada++;
      break;

    case "Cancelada":
      estadosContador.cancelada++;
      break;

    default:
      break;
  }
});

const estadosData = [
  {
    name: "Pendiente de confirmación",
    value:
      estadosContador.pendienteConfirmacion
  },
  {
    name: "Pendiente de inicio de viaje",
    value:
      estadosContador.pendienteInicio
  },
  {
    name: "En Curso",
    value:
      estadosContador.enCurso
  },
  {
    name:
      "Pendiente de confirmación de entrega",
    value:
      estadosContador.pendienteEntrega
  },
  {
    name: "Entregada",
    value:
      estadosContador.entregada
  },
  {
    name: "Cancelada",
    value:
      estadosContador.cancelada
  }
];






const plantasMap = {};

enviosData.forEach((envio) => {
  const planta =
    envio.plantaDespacho || "Sin Planta";

  plantasMap[planta] =
    (plantasMap[planta] || 0) + 1;
});

const rankingData =
  Object.entries(plantasMap)
    .map(([planta, cantidad]) => ({
      sucursal: planta,
      envios: cantidad,
      porcentaje:
        totalEnvios > 0
          ? `${Math.round(
              (cantidad / totalEnvios) * 100
            )}%`
          : "0%"
    }))
    .sort(
      (a, b) =>
        b.envios - a.envios
    );

    const totalIncidencias = incidenciasData.length;

const incidenciasResueltas =
  incidenciasData.filter(
    (inc) => inc.resuelto === true
  ).length;

const incidenciasNoResueltas =
  incidenciasData.filter(
    (inc) => inc.resuelto === false
  ).length;

const incidenciasEstadoData = [
  {
    name: "Resueltas",
    value: incidenciasResueltas
  },
  {
    name: "No Resueltas",
    value: incidenciasNoResueltas
  }
];

const tiposIncidenciasMap = {};

incidenciasData.forEach((incidencia) => {
  const tipo =
    incidencia.tipoIncidencia ||
    "Sin Clasificar";

  tiposIncidenciasMap[tipo] =
    (tiposIncidenciasMap[tipo] || 0) + 1;
});

const rankingIncidenciasData =
  Object.entries(tiposIncidenciasMap)
    .map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
      porcentaje:
        totalIncidencias > 0
          ? `${Math.round(
              (cantidad / totalIncidencias) * 100
            )}%`
          : "0%"
    }))
    .sort(
      (a, b) =>
        b.cantidad - a.cantidad
    );


const meses = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic"
];

const mesesMap = {};

enviosData.forEach((envio) => {

  if (!envio.fechaCreacion) {
    return;
  }

  const fecha =
    new Date(envio.fechaCreacion);

  const mes =
    meses[fecha.getMonth()];

  mesesMap[mes] =
    (mesesMap[mes] || 0) + 1;
});

const evolucionMensualData =
  meses
    .filter(
      (mes) => mesesMap[mes]
    )
    .map((mes) => ({
      mes,
      envios: mesesMap[mes]
    }));



    
  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6"
  ];

useEffect(() => {
  const fetchData = async () => {
    try {

    const [
      enviosRes,
      incidenciasRes
    ] = await Promise.all([
      envios.getAllSupervisor(),
      datos.getIncidencias()
    ]);

    setEnviosData(enviosRes || []);
    setIncidenciasData(
      incidenciasRes || []
    );

      setLoading(false);

    } catch (error) {
      console.error("ERROR:", error);
      setLoading(false);
    }
  };

  fetchData();
}, []);



const exportarCSV = () => {

  const filas = [
    ["Tipo", "Nombre", "Valor"],

    ...estadosData.map(
      (item) => [
        "Estado",
        item.name,
        item.value
      ]
    ),

    ...rankingData.map(
      (item) => [
        "Sucursal",
        item.sucursal,
        item.envios
      ]
    ),
    
   ...incidenciasEstadoData.map(
      (item) => [
        "Incidencia Estado",
        item.name,
        item.value
      ]
    ),

    ...rankingIncidenciasData.map(
      (item) => [
        "Tipo Incidencia",
        item.tipo,
        item.cantidad
      ]
    ),



    ...evolucionMensualData.map(
      (item) => [
        "Mes",
        item.mes,
        item.envios
      ]
    )
  ];

  const csv =
    filas
      .map(
        (fila) =>
          fila.join(",")
      )
      .join("\n");

  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );

  FileSaver.saveAs(
    blob,
    "reporte-logistica.csv"
  );
};

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

      <div className="reportes-header">
        <div>
          <h1>Reportes</h1>
          <p>
            Aquí podras visualizar el rendimiento de tus envíos, analizar tendencias y tomar decisiones informadas para optimizar tu logística.
          </p>
        </div>

        <button
          className="btn-exportar"
          onClick={exportarCSV}
        >
          Exportar Reporte CSV
        </button>
      </div>


      <section className="reportes-grid-cuadrado">

        <div className="chart-card square-card">
          <h2>Estados de Envíos</h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={estadosData}
                dataKey="value"
                outerRadius={110}
                label
              >
                {estadosData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card square-card">
          <h2>Ranking de Cargas</h2>

          <table className="reportes-table">
            <thead>
              <tr>
                <th>Sucursal</th>
                <th>Envíos</th>
                <th>%</th>
              </tr>
            </thead>

            <tbody>
              {rankingData.map((item, index) => (
                <tr key={index}>
                  <td>{item.sucursal}</td>
                  <td>{item.envios}</td>
                  <td>{item.porcentaje}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>


      <section className="reportes-grid-cuadrado">

      <div className="chart-card square-card">
        <h2>Estado de Incidencias</h2>

        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <PieChart>
            <Pie
              data={incidenciasEstadoData}
              dataKey="value"
              outerRadius={110}
              label
            >
              {incidenciasEstadoData.map(
                (entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index % COLORS.length
                      ]
                    }
                  />
                )
              )}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card square-card">
        <h2>Ranking de Incidencias</h2>

        <table className="reportes-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>%</th>
            </tr>
          </thead>

          <tbody>
            {rankingIncidenciasData.map(
              (item, index) => (
                <tr key={index}>
                  <td>{item.tipo}</td>
                  <td>{item.cantidad}</td>
                  <td>{item.porcentaje}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      </section>


      <section className="charts-grid">

      <div className="chart-card full-width">
        <h2>Evolución Mensual</h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={evolucionMensualData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="envios"
              stroke="#3b82f6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </section>


    </div>
  );
}