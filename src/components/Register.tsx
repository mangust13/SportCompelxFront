import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Trainer");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("https://localhost:7270/api/auth/register", {
        username,
        password,
        roleName: role
      });
      navigate("/login");
    } catch (err: any) {
        if (err.response?.data) setError(err.response.data);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold">Реєстрація</h2>

        <input
          className="border p-2 w-full rounded"
          placeholder="Логін"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full rounded"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="border p-2 w-full rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Trainer">Trainer</option>
          <option value="InternalManager">Internal Manager</option>
          <option value="PurchaseManager">Purchase Manager</option>
        </select>

        {error && <div className="text-red-500">{error}</div>}

        <button
          className="w-full bg-primary text-white py-2 rounded"
          onClick={handleRegister}>
          Зареєструватися
        </button>

        <p className="text-sm text-center">
          Маєте акаунт?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
