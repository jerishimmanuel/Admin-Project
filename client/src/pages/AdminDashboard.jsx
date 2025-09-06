import React, { useEffect, useState, useRef } from "react";
import { api, authHeader } from "../api";
import { io } from "socket.io-client";

const sidebarStyle = {
  width: 220,
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px #0002",
  padding: "32px 0",
  minHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  position: "sticky",
  top: 32,
};

const sidebarTabStyle = (active) => ({
  padding: "14px 32px",
  cursor: "pointer",
  background: active ? "#2563eb" : "transparent",
  color: active ? "#fff" : "#2563eb",
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
  margin: "0 16px",
  textAlign: "left",
  transition: "background 0.2s",
});

const mainContentStyle = {
  flex: 1,
  marginLeft: 32,
  minWidth: 0,
};

const statCardStyle = {
  display: "flex",
  gap: 32,
  marginBottom: 32,
};

const statItemStyle = {
  background: "#2563eb",
  color: "#fff",
  borderRadius: 12,
  padding: "24px 32px",
  minWidth: 120,
  textAlign: "center",
  boxShadow: "0 2px 12px #0002",
  fontWeight: 600,
  fontSize: 22,
  letterSpacing: 1,
};

const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 12px #0002",
  padding: 32,
  marginBottom: 32,
  maxWidth: 900,
  textAlign: "left",
};

const alumniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 24,
  marginTop: 16,
};

const alumniCardStyle = {
  background: "#f3f6fa",
  borderRadius: 10,
  boxShadow: "0 1px 6px #0001",
  padding: 18,
  textAlign: "left",
  border: "1px solid #e5e7eb",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 16,
  background: "#fff",
  borderRadius: 8,
  overflow: "hidden",
  boxShadow: "0 1px 6px #0001",
};

const thtdStyle = {
  padding: "10px 16px",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "center",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  margin: "8px 0",
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
  marginLeft: 8,
  transition: "background 0.2s",
};

const chatBoxStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 16,
  height: 320,
  overflowY: "auto",
  margin: "16px 0",
  background: "#f8fafc",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const msgStyle = (isMe) => ({
  alignSelf: isMe ? "flex-end" : "flex-start",
  background: isMe ? "#2563eb" : "#e0e7ef",
  color: isMe ? "#fff" : "#222",
  borderRadius: 16,
  padding: "8px 16px",
  maxWidth: "70%",
  wordBreak: "break-word",
  boxShadow: "0 1px 4px #0001",
});

const labelStyle = { fontWeight: 500, marginBottom: 4, display: "block" };

const tabs = [
  { key: "dashboard", label: "Dashboard" },
  { key: "alumni", label: "Alumni List" },
  { key: "stats", label: "Dept & Section Stats" },
  { key: "chat", label: "Chat" },
];

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    registerNumber: "",
    department: "",
    section: "A",
    passOutYear: "",
    courseDurationYears: "4",
    placed: false,
    company: "",
    location: "",
    designation: "",
    minCTC: "",
  });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState([]);
  const [counts, setCounts] = useState({ alumni: 0, students: 0 });
  const [alumniList, setAlumniList] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : { name: "Admin", id: "admin" };
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    socketRef.current.on("chat message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = {
      user: user.name || "Admin",
      text: chatInput,
      time: new Date().toLocaleTimeString(),
    };
    socketRef.current.emit("chat message", msg);
    setChatInput("");
  }

  function isCourseCompleted() {
    const year = Number(form.passOutYear);
    const duration = Number(form.courseDurationYears);
    if (!year || !duration) return false;
    const currentYear = new Date().getFullYear();
    return currentYear >= year;
  }

  async function addAlumni(e) {
    e.preventDefault();
    setMsg("");
    if (!isCourseCompleted()) {
      setMsgType("error");
      setMsg("Alumni can only be added if the course duration is completed.");
      return;
    }
    try {
      await api.post(
        "/alumni",
        {
          ...form,
          passOutYear: Number(form.passOutYear),
          courseDurationYears: Number(form.courseDurationYears),
        },
        { headers: authHeader() }
      );
      setMsgType("success");
      setMsg("✅ Alumni added & email sent!");
      setForm({
        name: "",
        email: "",
        phone: "",
        registerNumber: "",
        department: "",
        section: "A",
        passOutYear: "",
        courseDurationYears: "4",
      });
      await loadStats();
      await loadCounts();
      await loadAlumniList();
    } catch (e) {
      setMsgType("error");
      setMsg(e.response?.data?.message || "Add failed");
    }
  }

  async function uploadExcel(e) {
    e.preventDefault();
    setMsg("");
    if (!file) {
      setMsgType("error");
      setMsg("Please select a file.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/alumni/upload", fd, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
      });
      setMsgType("success");
      setMsg(
        `✅ Uploaded: created ${data.created}, skipped ${data.skipped.length}, errors ${data.errors.length}`
      );
      setFile(null);
      await loadStats();
      await loadCounts();
      await loadAlumniList();
    } catch (e) {
      setMsgType("error");
      setMsg(e.response?.data?.message || "Upload failed");
    }
  }

  async function loadStats() {
    const { data } = await api.get("/alumni/stats", { headers: authHeader() });
    setStats(data);
  }

  async function loadCounts() {
    try {
      const { data } = await api.get("/stats/counts", { headers: authHeader() });
      setCounts(data);
    } catch {
      setCounts({ alumni: 0, students: 0 });
    }
  }

  async function loadAlumniList() {
    try {
      const { data } = await api.get("/alumni", { headers: authHeader() });
      setAlumniList(data);
    } catch {
      setAlumniList([]);
    }
  }

  useEffect(() => {
    loadStats();
    loadCounts();
    loadAlumniList();
  }, []);

  return (
    <div style={{ background: "#f3f6fa", minHeight: "100vh", padding: 32, display: "flex" }}>

      <div style={sidebarStyle}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            style={sidebarTabStyle(activeTab === tab.key)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ marginTop: "auto", color: "#64748b", fontSize: 13, textAlign: "center", padding: 8 }}>
          &copy; {new Date().getFullYear()} Admin Panel
        </div>
      </div>

      <div style={mainContentStyle}>

        {activeTab === "dashboard" && (
          <>
            <h2 style={{ color: "#2563eb", marginBottom: 8 }}>Admin Dashboard</h2>
            <div style={statCardStyle}>
              <div style={statItemStyle}>
                <div>Alumni</div>
                <div style={{ fontSize: 32 }}>{counts.alumni}</div>
              </div>
              <div style={statItemStyle}>
                <div>Students</div>
                <div style={{ fontSize: 32 }}>{counts.students}</div>
              </div>
            </div>
            <div style={{ color: "#64748b", marginBottom: 32 }}>
              Manage alumni, upload data, and view department stats.
            </div>
            <div style={cardStyle}>
              <h3>Add Alumni (Manual)</h3>
              <form onSubmit={addAlumni} autoComplete="off">
                <label style={labelStyle}>Name</label>
                <input
                  style={inputStyle}
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <label style={labelStyle}>Email</label>
                <input
                  style={inputStyle}
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email"
                  required
                />
                <label style={labelStyle}>Phone Number</label>
                <input
                  style={inputStyle}
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
                <label style={labelStyle}>Register Number</label>
                <input
                  style={inputStyle}
                  placeholder="Register Number"
                  value={form.registerNumber}
                  onChange={e => setForm({ ...form, registerNumber: e.target.value })}
                  required
                />
                <label style={labelStyle}>Department</label>
                <input
                  style={inputStyle}
                  placeholder="Enter department"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                />
                <label style={labelStyle}>Section</label>
                <select
                  style={inputStyle}
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                >
                  {["A", "B", "C", "D", "E", "F"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <label style={labelStyle}>Pass-out Year</label>
                <input
                  style={inputStyle}
                  placeholder="Pass-out Year"
                  value={form.passOutYear}
                  onChange={(e) =>
                    setForm({ ...form, passOutYear: e.target.value })
                  }
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  required
                />
                <label style={labelStyle}>Course Duration (years)</label>
                <input
                  style={inputStyle}
                  placeholder="Course Duration (years)"
                  value={form.courseDurationYears}
                  onChange={(e) =>
                    setForm({ ...form, courseDurationYears: e.target.value })
                  }
                  type="number"
                  min="1"
                  max="10"
                  required
                />
                <label style={labelStyle}>
                  Placed?
                  <input
                    type="checkbox"
                    checked={form.placed}
                    onChange={e => setForm({ ...form, placed: e.target.checked })}
                    style={{ marginLeft: 8 }}
                  />
                </label>
                {form.placed && (
                  <>
                    <label style={labelStyle}>Company</label>
                    <input
                      style={inputStyle}
                      placeholder="Company Name"
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      required={form.placed}
                    />
                    <label style={labelStyle}>Location</label>
                    <input
                      style={inputStyle}
                      placeholder="Location"
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      required={form.placed}
                    />
                    <label style={labelStyle}>Designation</label>
                    <input
                      style={inputStyle}
                      placeholder="Designation"
                      value={form.designation || ""}
                      onChange={e => setForm({ ...form, designation: e.target.value })}
                      required={form.placed}
                    />
                    <label style={labelStyle}>Minimum CTC (LPA)</label>
                    <input
                      style={inputStyle}
                      placeholder="Minimum CTC"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minCTC}
                      onChange={e => setForm({ ...form, minCTC: e.target.value })}
                      required={form.placed}
                    />
                  </>
                )}
                <button style={buttonStyle} type="submit">
                  Add Alumni
                </button>
              </form>
              {msgType === "error" && msg && (
                <div style={{
                  color: "#b91c1c",
                  background: "#ffe0e0",
                  padding: "8px 16px",
                  borderRadius: 8,
                  marginTop: 12,
                  textAlign: "center",
                  fontWeight: 500,
                }}>
                  {msg}
                </div>
              )}
            </div>
            <div style={cardStyle}>
              <h3>Bulk Upload via Excel</h3>
              <form onSubmit={uploadExcel}>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".xlsx,.xls"
                  style={{ marginBottom: 12 }}
                />
                <button style={buttonStyle} type="submit">
                  Upload
                </button>
              </form>
            </div>
            {msgType === "success" && msg && (
              <div
                style={{
                  margin: "24px auto",
                  maxWidth: 480,
                  padding: "12px 24px",
                  borderRadius: 8,
                  background: "#e0f7e9",
                  color: "#15803d",
                  fontWeight: 500,
                  textAlign: "center",
                  boxShadow: "0 1px 6px #0001",
                }}
              >
                {msg}
              </div>
            )}
          </>
        )}


        {activeTab === "alumni" && (
          <div style={cardStyle}>
            <h3>Alumni List</h3>
            <div style={alumniGridStyle}>
              {alumniList.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#64748b" }}>
                  No alumni found.
                </div>
              )}
              {alumniList.map((alum, idx) => (
                <div key={alum._id || idx} style={alumniCardStyle}>
                  <div style={{ fontWeight: 600, fontSize: 18, color: "#2563eb" }}>{alum.name}</div>
                  <div style={{ margin: "4px 0", color: "#555" }}>{alum.email}</div>
                  <div style={{ fontSize: 14, color: "#64748b" }}>
                    <b>Dept:</b> {alum.department} &nbsp; <b>Sec:</b> {alum.section}
                  </div>
                  <div style={{ fontSize: 14, color: "#64748b" }}>
                    <b>Reg No:</b> {alum.registerNumber} &nbsp; <b>Phone:</b> {alum.phone}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    <b>Pass-out:</b> {alum.passOutYear} &nbsp; <b>Duration:</b> {alum.courseDurationYears} yrs
                  </div>
                  <div style={{ fontSize: 13, color: alum.placed ? "#15803d" : "#b91c1c", marginTop: 4 }}>
                    <b>Placed:</b> {alum.placed ? "Yes" : "No"}
                    {alum.placed && (
                      <>
                        <br />
                        <b>Company:</b> {alum.company} <br />
                        <b>Location:</b> {alum.location} <br />
                        <b>Min CTC:</b> {alum.minCTC} LPA
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {activeTab === "stats" && (
          <div style={cardStyle}>
            <h3>Department & Section Counts</h3>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={thtdStyle}>Department</th>
                  <th style={thtdStyle}>Section</th>
                  <th style={thtdStyle}>Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((r, i) => (
                  <tr key={i}>
                    <td style={thtdStyle}>{r._id.department}</td>
                    <td style={thtdStyle}>{r._id.section}</td>
                    <td style={thtdStyle}>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {activeTab === "chat" && (
          <div style={cardStyle}>
            <h3>Admin Chat</h3>
            <div style={chatBoxStyle}>
              {chatMessages.length === 0 ? (
                <div style={{ color: "#64748b", textAlign: "center" }}>
                  No messages yet.
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} style={msgStyle(msg.user === (user.name || "Admin"))}>
                    <b>{msg.user}:</b> {msg.text}
                    <span style={{ float: "right", color: "#94a3b8", fontSize: 12, marginLeft: 8 }}>
                      {msg.time}
                    </span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={sendChat}
              style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}
            >
              <input
                style={inputStyle}
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) sendChat(e); }}
              />
              <button style={buttonStyle} type="submit">
                Send
              </button>
            </form>
            <div style={{ marginTop: 16, color: "#64748b", fontSize: 14 }}>
              <b>Note:</b> All admins see the same chat (broadcast).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}