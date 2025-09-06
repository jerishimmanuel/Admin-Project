import React, { useEffect, useState } from "react";
import { api, authHeader } from "../api";
import { useNavigate } from "react-router-dom";

const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 12px #0002",
  padding: 32,
  margin: "24px auto",
  maxWidth: 900,
};

const filterRow = {
  display: "flex",
  gap: 16,
  marginBottom: 24,
  alignItems: "center",
  flexWrap: "wrap",
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #d0d7de",
  fontSize: 16,
  minWidth: 220,
};

const selectStyle = {
  ...inputStyle,
  minWidth: 140,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 8,
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

export default function AlumniList() {
  const [list, setList] = useState([]);
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    // eslint-disable-next-line
  }, [user, navigate]);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    if (section) params.append("section", section);
    const { data } = await api.get(`/alumni?${params.toString()}`, {
      headers: authHeader(),
    });
    setList(data);
    setLoading(false);
  }

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line
  }, [department, section, user]);

  if (!user) return null;

  return (
    <div style={{ background: "#f3f6fa", minHeight: "100vh", padding: 32 }}>
      <div style={cardStyle}>
        <h2 style={{ color: "#2563eb", marginBottom: 8, textAlign: "center" }}>
          Alumni Directory
        </h2>
        <div style={{ textAlign: "center", color: "#64748b", marginBottom: 24 }}>
          Browse and filter alumni by department and section.
        </div>
        <div style={filterRow}>
          <input
            style={inputStyle}
            placeholder="Filter by Department"
            value={department}
            onChange={e => setDepartment(e.target.value)}
          />
          <select
            style={selectStyle}
            value={section}
            onChange={e => setSection(e.target.value)}
          >
            <option value="">All Sections</option>
            {["A", "B", "C", "D", "E", "F"].map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", color: "#2563eb", margin: "32px 0" }}>
            Loading alumni...
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", color: "#b91c1c", margin: "32px 0" }}>
            No alumni found.
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={thtdStyle}>Name</th>
                <th style={thtdStyle}>Email</th>
                <th style={thtdStyle}>Department</th>
                <th style={thtdStyle}>Section</th>
                <th style={thtdStyle}>Pass-out Year</th>
              </tr>
            </thead>
            <tbody>
              {list.map(a => (
                <tr key={a._id}>
                  <td style={thtdStyle}>{a.name}</td>
                  <td style={thtdStyle}>
                    <a href={`mailto:${a.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                      {a.email}
                    </a>
                  </td>
                  <td style={thtdStyle}>{a.department}</td>
                  <td style={thtdStyle}>{a.section}</td>
                  <td style={thtdStyle}>{a.passOutYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}