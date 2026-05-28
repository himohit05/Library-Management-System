import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

interface Props {
  onLogin: (user: any) => void;
  goToRegister: () => void;
}

function Login({ onLogin, goToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
        role,
      });

      const data = res.data;

      // ? STORE IN LOCALSTORAGE (persistence)
      localStorage.setItem("token", data.token);
      localStorage.setItem("userid", data.userid);
      localStorage.setItem("role", data.role);
      localStorage.setItem("permissions", JSON.stringify(data.permissions || []));

      // ? SET REACT STATE (source of truth)
      onLogin({
        name: data.name,
        role: data.role,
        userid: data.userid,
        token: data.token,
        permissions: data.permissions || [],
        isNewUser: false,
      });

      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto mt-20 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

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
        onClick={handleLogin}
      >
        Login
      </button>

      <p className="mt-4 text-sm text-center">
        Don?t have an account?{" "}
        <span
          className="text-blue-500 cursor-pointer underline"
          onClick={goToRegister}
        >
          Click here to Register
        </span>
      </p>
    </div>
  );
}

export default Login;