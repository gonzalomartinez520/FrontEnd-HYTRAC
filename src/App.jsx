import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import OperarioDashboard from "./pages/OperarioDashboard.jsx";
import TransportistaDashboard from "./pages/TransportistaDashboard.jsx";
import IniciarViaje from "./pages/IniciarViaje.jsx";
import ReportarIncidencia from "./pages/ReportarIncidencia.jsx";
import EnvioDetail from "./pages/EnvioDetail.jsx";
import NuevoEnvio from "./pages/NuevoEnvio.jsx";
import HistorialOperador from "./pages/HistorialOperador.jsx"
import Confirmaciones from "./pages/Confirmaciones.jsx"
import ConfirmarEnvio from "./pages/ConfirmarEnvio.jsx";
import ConfirmarEntregas from "./pages/ConfirmarEntregas.jsx";
import ConfirmarInicioViaje from "./pages/ConfirmarInicioViaje.jsx";
import ConfirmarIncidencias from "./pages/ConfirmarIncidencias.jsx";
import Administrador from "./pages/Administrador.jsx";
import GestionOperario from "./pages/GestionOperario.jsx";
import GestionSupervisor from "./pages/GestionSupervisor.jsx";
import GestionTransportista from "./pages/GestionTransportista.jsx";
import GestionJefeEstacion from "./pages/GestionJefeEstacion.jsx";
import NuevoUsuario from "./pages/NuevoUsuario.jsx";
import AccesoDenegado from "./pages/AccesoDenegado.jsx"; 
import Navbar from "./components/Navbar.jsx";
import JefeEstacionDashboard from "./pages/JefeEstacionDashboard.jsx"; //importo pantalla

// 🔐 Validar expiración del token
const isTokenValid = (tokenString) => {
  try {
    const parsed = JSON.parse(tokenString);
    const jwt = parsed.token;

    const payload = JSON.parse(atob(jwt.split(".")[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

// 🔐 Obtener usuario desde localStorage validado
const getUserFromStorage = () => {
  const data = localStorage.getItem("token");

  if (!data || !isTokenValid(data)) {
    localStorage.removeItem("token");
    return null;
  }

  return JSON.parse(data);
};

const getNormalizedRole = (userLike) => {
  return String(userLike?.normalizedRole || userLike?.role || "").toUpperCase();
};

const getHomePath = (userLike) => {
  const role = getNormalizedRole(userLike);

  if (role === "TRANSPORTISTA") {
    return "/transportista";
  }
  if (role === "JEFE_ESTACION") {
    return "/jefe-estacion";
  }
  if (role === "ADMIN") {
    return "/administrador";
  }

  return "/dashboard";
};

function App() {
  const [user, setUser] = useState(getUserFromStorage());
  const navigate = useNavigate();
  const location = useLocation();

  const parsedUser = getUserFromStorage();

  const handleLogin = (userData) => {
    setUser(userData);
    navigate(getHomePath(userData));
  };

  // 🔐 Protección por rol
  const ProtectedRoute = ({ allowedRoles, children }) => {
    const userToken = localStorage.getItem("token");

    if (!userToken || !isTokenValid(userToken)) {
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }

    const parsedToken = JSON.parse(userToken);
    const userRole = getNormalizedRole(parsedToken);
    const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      return <Navigate to="/acceso-denegado" />;
    }

    return children;
  };

  return (
    <>
      {/* ✅ Navbar visible siempre si hay sesión válida */}
      {location.pathname !== "/login" && parsedUser && (
        <Navbar user={parsedUser} onLogout={setUser} />
      )}

      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            !parsedUser ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to={getHomePath(parsedUser)} />
            )
          }
        />

        {/* ACCESO DENEGADO */}
        <Route path="/acceso-denegado" element={<AccesoDenegado user={parsedUser}/>} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["OPERADOR", "SUPERVISOR"]}
            >
              <OperarioDashboard user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* TRANSPORTISTA */}
        <Route
          path="/transportista"
          element={
            <ProtectedRoute allowedRoles={["TRANSPORTISTA"]}>
              <TransportistaDashboard user={parsedUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transportista/incidencia"
          element={
            <ProtectedRoute allowedRoles={["TRANSPORTISTA"]}>
              <ReportarIncidencia user={parsedUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transportista/orden/:ordenId/iniciar-viaje"
          element={
            <ProtectedRoute allowedRoles={["TRANSPORTISTA"]}>
              <IniciarViaje user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* DETALLE */}
        <Route
          path="/ordenes/:id"
          element={
            <ProtectedRoute
              allowedRoles={["OPERADOR", "SUPERVISOR", "JEFE_ESTACION"]}
            >
              <EnvioDetail user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* NUEVO ENVIO */}
        <Route
          path="/nuevo-envio"
          element={
            <ProtectedRoute allowedRoles={["OPERADOR"]}>
              <NuevoEnvio user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* HISTORIAL DEL OPERADOR*/}
        <Route
          path="/historial-operador"
          element={
            <ProtectedRoute allowedRoles={["OPERADOR"]}>
              <HistorialOperador user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* CONFIRMACIONES */}
        <Route
          path="/confirmaciones"
          element={
            <ProtectedRoute allowedRoles={["SUPERVISOR"]}>
              <Confirmaciones user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* CONFIRMAR ENVIO */}
        <Route
          path="/confirmar-envio"
          element={
            <ProtectedRoute allowedRoles={["SUPERVISOR"]}>
              <ConfirmarEnvio user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* CONFIRMAR ENTREGAS */}
        <Route
          path="/confirmar-entregas"
          element={
            <ProtectedRoute allowedRoles={["SUPERVISOR"]}>
              <ConfirmarEntregas user={parsedUser} />
            </ProtectedRoute>
          } 
        />

        {/* CONFIRMAR INCIDENCIAS */}
        <Route
        path="/confirmar-incidencias"
        element={
          <ProtectedRoute allowedRoles={["SUPERVISOR"]}>
            <ConfirmarIncidencias user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* CONFIRMAR INICIO DEL VIAJE */}
        <Route
          path="/confirmar-inicio-viaje"
          element={
            <ProtectedRoute allowedRoles={["SUPERVISOR"]}>
              <ConfirmarInicioViaje user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* JEFE ESTACION DASHBOARD */}
        <Route
          path="/jefe-estacion"
          element={
            <ProtectedRoute allowedRoles={["JEFE_ESTACION"]}>
              <JefeEstacionDashboard user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* ADMINISTRADOR */}
        <Route
          path="/administrador"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Administrador user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* NUEVO USUARIO */}
        <Route
          path="/alta-usuario"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <NuevoUsuario user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* GESTION OPERADOR */}
        <Route  
          path="/gestion-operarios"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <GestionOperario user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* GESTION SUPERVISOR */}
        <Route
          path="/gestion-supervisores"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <GestionSupervisor user={parsedUser}/>
            </ProtectedRoute>
          }
        />

        {/* GESTION TRANSPORTISTA */}
        <Route
          path="/gestion-transportistas"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <GestionTransportista user={parsedUser}/>
            </ProtectedRoute>
          }
        />

        {/* GESTION JEFE DE ESTACION */}
        <Route
          path="/gestion-jefe-estacion"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <GestionJefeEstacion user={parsedUser}/>
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            parsedUser ? (
              <Navigate to={getHomePath(parsedUser)} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;