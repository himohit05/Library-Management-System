import { useState } from "react";
import axios from "axios";

interface Props {
  token?: string; // optional now
  goBack?: () => void; // keep existing admin flow
}

export default function Register_User({ token, goBack }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default role
  const [message, setMessage] = useState("");



  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/register",
        { name, email, password, role },
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {}
      );
      setMessage(res.data.message);
      // reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register New User</h2>

      {message && (
        <div className="mb-4 p-2 bg-gray-200 rounded text-center">{message}</div>
      )}

      <input
        type="text"
        placeholder="Name"
        className="border p-2 w-full mb-3 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full mb-3 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full mb-3 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 w-full mb-3 rounded"
      >
        <option value="user">User</option>
        <option value="admin">Librarian</option>
      </select>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        onClick={handleRegister}
      >
        Register
      </button>

  

      {goBack && (
        <button
          onClick={goBack}
          className="bg-blue-400 text-white px-4 py-2 rounded mt-2"
        >
          Back
        </button>
      )}
    </div>
  );
}