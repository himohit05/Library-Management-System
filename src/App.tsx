import { useState, useEffect } from "react";
import "./styles/App.css";
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./components/Dashboard"

function App() {
  const [user, setUser] = useState<any>(null);
  const [authPage, setAuthPage] = useState<"login" | "Register">("login");

  // ? RESTORE USER ON PAGE LOAD
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userid = localStorage.getItem("userid");
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

    if (token && role) {
      setUser({
        token,
        role,
        userid,
        permissions,
      });
    }
  }, []);

  // ? LOGIN
  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  // ? LOGOUT (clean version)
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
  };

  // ? NOT LOGGED IN
  if (!user) {
    return authPage === "login" ? (
      <Login
        onLogin={handleLogin}
        goToRegister={() => setAuthPage("Register")}
      />
    ) : (
      <Register
        goToLogin={() => setAuthPage("login")}
        onLogin={handleLogin}
      />
    );
  }

  // ? ADMIN
  if (user.role === "admin") {
    return (
      <Dashboard
        email={user.email}
        role={user.role}
        token={user.token}
        onLogout={handleLogout}
        user={user}
      />
    );
  }

  // ? USER
  return (
    <Dashboard
      email={user.email}
      role={user.role}
      token={user.token}
      onLogout={handleLogout}
      user={user}
    />
  );
}

export default App;