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

import { envios } from "@/api";

export default function Reportes({ user }) {
  const [loading, setLoading] = useState(true);

  const [enviosData, setEnviosData] = useState([]);
  


const totalEnvios = enviosData.length;

const estadosContador = {
  entregada: 0,
  pendiente: 0,
  transito: 0,
  demorada: 0
};

enviosData.forEach((envio) => {
  const estado =
    envio.estado?.toLowerCase().trim() || "";

  if (estado.includes("entreg")) {
    estadosContador.entregada++;
  }
  else if (estado.includes("trans")) {
    estadosContador.transito++;
  }
  else if (estado.includes("demor")) {
    estadosContador.demorada++;
  }
  else {
    estadosContador.pendiente++;
  }
});

const estadosData = [
  {
    name: "Entregada",
    value: estadosContador.entregada
  },
  {
    name: "Pendiente",
    value: estadosContador.pendiente
  },
  {
    name: "En Tránsito",
    value: estadosContador.transito
  },
  {
    name: "Demorada",
    value: estadosContador.demorada
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
    "#ef4444"
  ];

useEffect(() => {
  const fetchData = async () => {
    try {

      const enviosRes =
        await envios.getAllSupervisor();

      setEnviosData(enviosRes || []);

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