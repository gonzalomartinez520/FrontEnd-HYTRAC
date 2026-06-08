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

import { envios, datos } from "@/api";

export default function Reportes({ user }) {
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState({
    total: 0,
    transito: 0,
    entregados: 0,
    demorados: 0,
    alta: 0,
    critica: 0
  });

  const estadosData = [
    { name: "Entregado", value: 240 },
    { name: "En Tránsito", value: 120 },
    { name: "En Sucursal", value: 80 },
    { name: "Demorado", value: 30 }
  ];

  const prioridadesData = [
    { prioridad: "Baja", cantidad: 70 },
    { prioridad: "Media", cantidad: 130 },
    { prioridad: "Alta", cantidad: 90 },
    { prioridad: "Crítica", cantidad: 40 }
  ];

  const evolucionMensualData = [
    { mes: "Ene", envios: 120 },
    { mes: "Feb", envios: 180 },
    { mes: "Mar", envios: 210 },
    { mes: "Abr", envios: 240 },
    { mes: "May", envios: 300 },
    { mes: "Jun", envios: 350 }
  ];

  const sucursalesData = [
    { sucursal: "Buenos Aires", envios: 420 },
    { sucursal: "Córdoba", envios: 280 },
    { sucursal: "Neuquén", envios: 360 },
    { sucursal: "Mendoza", envios: 190 },
    { sucursal: "Comodoro", envios: 160 }
  ];

  const rankingData = [
    {
      sucursal: "Buenos Aires",
      envios: 420,
      porcentaje: "29%"
    },
    {
      sucursal: "Neuquén",
      envios: 360,
      porcentaje: "25%"
    },
    {
      sucursal: "Córdoba",
      envios: 280,
      porcentaje: "19%"
    },
    {
      sucursal: "Mendoza",
      envios: 190,
      porcentaje: "13%"
    },
    {
      sucursal: "Comodoro",
      envios: 160,
      porcentaje: "11%"
    }
  ];

  const rutasData = [
    {
      origen: "Buenos Aires",
      destino: "Neuquén",
      cantidad: 120
    },
    {
      origen: "Neuquén",
      destino: "Mendoza",
      cantidad: 95
    },
    {
      origen: "Córdoba",
      destino: "Comodoro",
      cantidad: 82
    },
    {
      origen: "Buenos Aires",
      destino: "Mendoza",
      cantidad: 76
    },
    {
      origen: "Neuquén",
      destino: "Buenos Aires",
      cantidad: 71
    }
  ];

  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444"
  ];

  useEffect(() => {
  const fetchData = async () => {
    try {

      const [enviosRes, incidenciasRes] =
        await Promise.all([
          envios.getAllSupervisor(),
          datos.getIncidencias()
        ]);

      console.log("=================================");
      console.log("ENVIOS COMPLETOS");
      console.log(enviosRes);
      console.table(enviosRes);

      console.log("=================================");
      console.log("PRIMER ENVIO");
      console.log(enviosRes?.[0]);

      console.log("=================================");
      console.log("ENVIOS JSON");
      console.log(
        JSON.stringify(
          enviosRes?.[0],
          null,
          2
        )
      );

      console.log("=================================");
      console.log("INCIDENCIAS COMPLETAS");
      console.log(incidenciasRes);
      console.table(incidenciasRes);

      console.log("=================================");
      console.log("PRIMERA INCIDENCIA");
      console.log(incidenciasRes?.[0]);

      console.log("=================================");
      console.log("INCIDENCIA JSON");
      console.log(
        JSON.stringify(
          incidenciasRes?.[0],
          null,
          2
        )
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
      [
        "Tipo",
        "Nombre",
        "Valor"
      ],

      ...estadosData.map((item) => [
        "Estado",
        item.name,
        item.value
      ]),

      ...prioridadesData.map((item) => [
        "Prioridad",
        item.prioridad,
        item.cantidad
      ]),

      ...evolucionMensualData.map((item) => [
        "Mes",
        item.mes,
        item.envios
      ]),

      ...sucursalesData.map((item) => [
        "Sucursal",
        item.sucursal,
        item.envios
      ])
    ];

    const csv = filas
      .map((fila) => fila.join(","))
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;"
      }
    );

    FileSaver.saveAs(blob, "reporte-logistica.csv");
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

