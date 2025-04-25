import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";

import Login from "./components/Login";
import Register from './components/Register';

import Layout from "./layout/Layout";

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
        localStorage.removeItem("user"); // на всякий випадок
      }
      initialized.current = true;
    }
  }, [login]);
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={user ? <Layout /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}