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
import { useTranslation } from "react-i18next";

export default function Reportes({ user }) {
  const { t } = useTranslation("reportes");
  const { t: tCommon } = useTranslation("common");

  const [loading, setLoading] = useState(true);

  const [enviosData, setEnviosData] = useState([]);
  const [incidenciasData, setIncidenciasData] = useState([]);


  const totalEnvios = enviosData.filter(
    (envio) => envio.confirmado === true
  ).length;

const obtenerEstadoReal = (envio) => {

  if(envio.confirmado && envio.estado === "Pendiente") {
    return envio.estado;
  }

  if(envio.confirmado) {
    return envio.estado || "Otro";
  }
};

const estadosContador = {
  pendiente: 0,
  pendienteInicioViaje: 0,
  enCurso: 0,
  pendienteEntrega: 0,
  entregada: 0,
  cancelada: 0
};

enviosData.forEach((envio) => {

  const estadoReal =
    obtenerEstadoReal(envio);

  switch (estadoReal) {

    case "Pendiente":
      estadosContador.pendiente++;
      break;

    case "Pendiente de inicio de viaje":
      estadosContador.pendienteInicioViaje++;
      break;

    case "Pendiente de confirmacion de entrega":
      estadosContador.pendienteEntrega++;
      break;

    case "En Curso":
      estadosContador.enCurso++;
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
    name: tCommon("status.pendiente"),
    value:
      estadosContador.pendiente
  },
  {
    name: tCommon("status.pendiente_inicio_viaje"),
    value:
      estadosContador.pendienteInicioViaje
  },
  {
    name:
      tCommon("status.pendiente_confirmacion_entrega"),
    value:
      estadosContador.pendienteEntrega
  },
  {
    name: tCommon("status.en_curso"),
    value:
      estadosContador.enCurso
  },
  {
    name: tCommon("status.entregada"),
    value:
      estadosContador.entregada
  },
  {
    name: tCommon("status.cancelada"),
    value:
      estadosContador.cancelada
  }
];




const plantasMap = {};

enviosData
  .filter((envio) => envio.confirmado === true)
  .forEach((envio) => {
    const planta =
      envio.plantaDespacho || t("misc.noPlant");

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
    .sort((a, b) => b.envios - a.envios)
    .slice(0, 5); 

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
    name: t("incidents.resolved"),
    value: incidenciasResueltas
  },
  {
    name: t("incidents.unresolved"),
    value: incidenciasNoResueltas
  }
];

const tiposIncidenciasMap = {};

incidenciasData.forEach((incidencia) => {
  const tipo =
    incidencia.tipoIncidencia ||
    t("incidents.unclassified");

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
    .sort((a, b) => b.envios - a.envios)
    .slice(0, 5); 


const meses = [
  t("months.jan"),
  t("months.feb"),
  t("months.mar"),
  t("months.apr"),
  t("months.may"),
  t("months.jun"),
  t("months.jul"),
  t("months.aug"),
  t("months.sep"),
  t("months.oct"),
  t("months.nov"),
  t("months.dec")
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



    
  const ESTADOS = [
  "#b45309",
  "#f59e0b",
  "#fde68a",
  "#3B82F6",
  "#10B981",
  "#EF4444",
  ];

  const INCIDENCIAS = [
    "#10B981",
    "#f59e0b",
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
    [ t("csv.type"),
      t("csv.name"),
      t("csv.value")],

    ...estadosData.map(
      (item) => [
        t("csv.status"),
        item.name,
        item.value
      ]
    ),

    ...rankingData.map(
      (item) => [
        t("csv.branch"),
        item.sucursal,
        item.envios
      ]
    ),
    
   ...incidenciasEstadoData.map(
      (item) => [
        t("csv.incidentStatus"),
        item.name,
        item.value
      ]
    ),

    ...rankingIncidenciasData.map(
      (item) => [
        t("csv.incidentType"),
        item.tipo,
        item.cantidad
      ]
    ),



    ...evolucionMensualData.map(
      (item) => [
        t("csv.month"),
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
    t("csv.fileName")
  );
};

  if (loading) {
    return (
      <div className="reportes-loading-screen">
        <div className="reportes-loader"></div>
        <h2>{t("loading")}</h2>
      </div>
    );
  }

  return (
    <div className="reportes-layout">

      <div className="reportes-header">
        <div>
          <h1>{t("title")}</h1>
          <p>
            {t("description")}
          </p>
        </div>

        <button
          className="btn-exportar"
          onClick={exportarCSV}
        >
          {t("buttons.export")}
        </button>
      </div>


      <section className="reportes-grid-cuadrado">

        <div className="chart-card square-card">
          <h2>{t("charts.shipmentStatus")}</h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={estadosData}
                dataKey="value"
                outerRadius={110}
                label
                cx="40%"
              >
                {estadosData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={ESTADOS[index % ESTADOS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card square-card">
          <h2>{t("charts.shipmentRanking")}</h2>

          <table className="reportes-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("table.branch")}</th>
                <th>{t("table.shipments")}</th>
                <th>%</th>
              </tr>
            </thead>

            <tbody>
              {rankingData.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </td>
                    <td>{item.sucursal}</td>
                    <td>{item.envios}</td>
                    <td className="porcentaje">{item.porcentaje}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </section>


      <section className="reportes-grid-cuadrado">

      <div className="chart-card square-card">
        <h2>{t("charts.incidentsStatus")}</h2>

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
              cx="40%"
            >
              {incidenciasEstadoData.map(
                (entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      INCIDENCIAS[
                        index % INCIDENCIAS.length
                      ]
                    }
                  />
                )
              )}
            </Pie>

            <Tooltip />
            <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                
              />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card square-card">
        <h2>{t("charts.incidentsRanking")}</h2>

        <table className="reportes-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("table.type")}</th>
              <th>{t("table.quantity")}</th>
              <th>%</th>
            </tr>
          </thead>

          <tbody>
            {rankingIncidenciasData.map(
              (item, index) => (
                <tr key={index}>
                  <td>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </td>
                  <td>{item.tipo}</td>
                  <td>{item.cantidad}</td>
                  <td className="porcentaje">{item.porcentaje}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      </section>


      <section className="charts-grid">

      <div className="chart-card full-width">
        <h2>{t("charts.monthlyEvolution")}</h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={evolucionMensualData}>
            <CartesianGrid stroke="#444" />
              <XAxis 
                dataKey="mes"
                tick={{ fill: "var(--text-primary)" }}
                axisLine={{ stroke: "#fff" }}
                tickLine={{ stroke: "#fff" }}
              />

              <YAxis 
                tick={{ fill: "var(--text-primary)" }}
                axisLine={{ stroke: "#fff" }}
                tickLine={{ stroke: "#fff" }}
              />

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