import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

interface Props {
  goToLogin: () => void;
  onLogin: (user: any) => void;
}

export default function Register({ goToLogin, onLogin }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      // Step 1: Register
      await axios.post("http://localhost:5000/register", {
        name,
        email,
        password,
        role,
      });

      // Step 2: Auto login
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
	role,
      });

      // Step 3: Store token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userid", res.data.userid);

      // Step 4: Update app state
      onLogin({
        name: res.data.name,
        role: res.data.role,
        userid: res.data.userid,
        isNewUser: true  // ✅ ADD
      });

      // Step 5: Redirect
      navigate("/");

      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto mt-20 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>

      {message && (
        <div className="mb-4 p-2 bg-gray-200 rounded text-center">
          {message}
        </div>
      )}

      <input
        className="border p-2 w-full mb-4"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-4"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-4"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        onClick={handleRegister}
      >
        Register
      </button>

      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <span
          className="text-blue-500 cursor-pointer underline"
          onClick={goToLogin}
        >
          Login
        </span>
      </p>
    </div>
  );
}