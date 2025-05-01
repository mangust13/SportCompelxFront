import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";

import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./layout/Layout";

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  const { user, login } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const rawUser = localStorage.getItem("user");
      try {
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          if (parsed?.role && parsed?.username) login(parsed);
        }
      } catch (e) {
        console.error("Помилка при читанні user з localStorage:", e);
        localStorage.removeItem("user");
      }
      initialized.current = true;
    }
  }, [login]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const userRolePath = user.role.toLowerCase();

  return (
    <>
      <Routes>
      <Route path="/login" element={<Navigate to={`/${userRolePath}`} replace />} />
      <Route path="/register" element={<Navigate to={`/${userRolePath}`} replace />} />

      <Route
        path="/trainer"
        element={user.role === "Trainer" ? <Layout /> : <Navigate to={`/${userRolePath}`} />}
      />
      <Route
        path="/internalmanager"
        element={user.role === "InternalManager" ? <Layout /> : <Navigate to={`/${userRolePath}`} />}
      />
      <Route
        path="/purchasemanager"
        element={user.role === "PurchaseManager" ? <Layout /> : <Navigate to={`/${userRolePath}`} />}
      />

      <Route path="*" element={<Navigate to={`/${userRolePath}`} />} />
    </Routes>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
    
  );
}
