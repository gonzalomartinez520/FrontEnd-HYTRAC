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
import ReportarIncidencia from "./pages/ReportarIncidencia.jsx";
import EnvioDetail from "./pages/EnvioDetail.jsx";
import NuevoEnvio from "./pages/NuevoEnvio.jsx";
import ConfirmarEnvio from "./pages/ConfirmarEnvio.jsx";
import AccesoDenegado from "./pages/AccesoDenegado.jsx"; 
import Navbar from "./components/Navbar.jsx";

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
        <Route path="/acceso-denegado" element={<AccesoDenegado />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["OPERADOR", "SUPERVISOR", "ADMIN"]}
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

        {/* DETALLE */}
        <Route
          path="/ordenes/:id"
          element={
            <ProtectedRoute
              allowedRoles={["OPERADOR", "SUPERVISOR", "ADMIN"]}
            >
              <EnvioDetail user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* NUEVO ENVIO */}
        <Route
          path="/nuevo-envio"
          element={
            <ProtectedRoute allowedRoles={["OPERADOR", "ADMIN"]}>
              <NuevoEnvio user={parsedUser} />
            </ProtectedRoute>
          }
        />

        {/* CONFIRMAR ENVIO */}
        <Route
          path="/confirmar-envio"
          element={
            <ProtectedRoute allowedRoles={["SUPERVISOR", "ADMIN"]}>
              <ConfirmarEnvio user={parsedUser} />
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