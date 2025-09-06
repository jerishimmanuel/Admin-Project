import React, { useState } from "react";
import { api } from "../api";

const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 12px #0002",
  padding: 32,
  margin: "64px auto",
  maxWidth: 400,
  textAlign: "left",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  margin: "12px 0",
  borderRadius: 6,
  border: "1px solid #d0d7de",
  fontSize: 16,
};

const buttonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "10px 20px",
  fontSize: 16,
  cursor: "pointer",
  width: "100%",
  marginTop: 8,
  transition: "background 0.2s",
};

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMsg("✅ Signed up!");
    } catch (e) {
      setMsg(e.response?.data?.message || "Signup failed");
    }
    setLoading(false);
  }

  return (
    <div style={{ background: "#f3f6fa", minHeight: "100vh", padding: 32 }}>
      <form onSubmit={onSubmit} style={cardStyle} autoComplete="off">
        <h2 style={{ color: "#2563eb", textAlign: "center", marginBottom: 16 }}>Admin Signup</h2>
        <label style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>Name</label>
        <input
          style={inputStyle}
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <label style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>Email</label>
        <input
          style={inputStyle}
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          type="email"
          required
        />
        <label style={{ fontWeight: 500, marginBottom: 4, display: "block" }}>Password</label>
        <input
          style={inputStyle}
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />
        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
        {msg && (
          <div
            style={{
              marginTop: 16,
              color: msg.startsWith("✅") ? "#15803d" : "#b91c1c",
              background: msg.startsWith("✅") ? "#e0f7e9" : "#ffe0e0",
              padding: "10px 16px",
              borderRadius: 8,
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}