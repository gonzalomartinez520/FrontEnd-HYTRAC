import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import OperarioDashboard from "./pages/OperarioDashboard.jsx";
import EnvioDetail from "./pages/EnvioDetail.jsx";
import NuevoEnvio from "./pages/NuevoEnvio.jsx";
import Navbar from "./components/Navbar.jsx";
import ConfirmarEnvio from "./pages/ConfirmarEnvio.jsx";

// 🆕 Página acceso denegado inline (Si es necesario, se mueve como componente)
const AccesoDenegado = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>⛔ Acceso denegado</h2>
      <p>No tenés permisos para acceder a esta sección.</p>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "1rem",
          padding: "10px 20px",
          cursor: "pointer"
        }}
      >
        Volver al inicio
      </button>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/dashboard");
  };

  // 🔐 Protección por rol
  const ProtectedRoute = ({ user, allowedRoles, children }) => {
    // ❌ No logueado
    if (!user) return <Navigate to="/login" />;

    // ⛔ Sin permisos
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/acceso-denegado" />;
    }

    // ✅ Permitido
    return children;
  };

  return (
    <>
      {user && <Navbar user={user} onLogout={setUser} />}

      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            !user ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* ACCESO DENEGADO */}
        <Route path="/acceso-denegado" element={<AccesoDenegado />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} allowedRoles={["OPERADOR", "SUPERVISOR", "ADMIN"]}>
              <OperarioDashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* DETALLE */}
        <Route
          path="/ordenes/:id"
          element={
            <ProtectedRoute user={user} allowedRoles={["OPERADOR", "SUPERVISOR", "ADMIN"]}>
              <EnvioDetail user={user} />
            </ProtectedRoute>
          }
        />

        {/* NUEVO ENVIO */}
        <Route
          path="/nuevo-envio"
          element={
            <ProtectedRoute user={user} allowedRoles={["OPERADOR", "ADMIN"]}>
              <NuevoEnvio user={user} />
            </ProtectedRoute>
          }
        />

        {/* CONFIRMAR ENVIO */}
        <Route
          path="/confirmar-envio"
          element={
            <ProtectedRoute user={user} allowedRoles={["SUPERVISOR", "ADMIN"]}>
              <ConfirmarEnvio user={user} />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK INTELIGENTE */}
        <Route
          path="*"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </>
  );
}

export default App;