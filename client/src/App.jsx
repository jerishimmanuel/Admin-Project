import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const navStyle = {
  display: "flex",
  gap: 18,
  marginBottom: 24,
  alignItems: "center",
  background: "#2563eb",
  padding: "14px 32px",
  borderRadius: 12,
  boxShadow: "0 2px 12px #0001",
};

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: 17,
  padding: "6px 14px",
  borderRadius: 6,
  transition: "background 0.2s",
};

const userInfoStyle = {
  marginLeft: "auto",
  color: "#fff",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const logoutBtnStyle = {
  background: "#fff",
  color: "#2563eb",
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  fontWeight: 500,
  cursor: "pointer",
  marginLeft: 8,
  transition: "background 0.2s, color 0.2s",
};

export default function App() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  }
  return (
    <div style={{ fontFamily: "sans-serif", background: "#f3f6fa", minHeight: "100vh", padding: 0 }}>
      <h1 style={{ textAlign: "center", color: "#2563eb", margin: "32px 0 0 0", fontSize: 32, letterSpacing: 1 }}>
        Alumni Data Management and Engagement
      </h1>
      <nav style={navStyle}>
        <Link to="/login" style={linkStyle}>Login</Link>
        <Link to="/signup" style={linkStyle}>Signup</Link>
        {user && user.role === "admin" && (
          <Link to="/admin" style={linkStyle}>Admin</Link>
        )}
        {/* {user && (
          <>
            <Link to="/alumni" style={linkStyle}>Alumni</Link>
            <Link to="/chat" style={linkStyle}>Chat</Link>
          </>
        )} */}
        {user && (
          <span style={userInfoStyle}>
            Hi, {user.name} ({user.role})
            <button style={logoutBtnStyle} onClick={logout}>Logout</button>
          </span>
        )}
      </nav>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <Outlet />
      </div>
    </div>
  );
}