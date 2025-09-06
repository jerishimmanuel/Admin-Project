import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AlumniList from "./pages/AlumniList.jsx";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="/login" />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="alumni" element={<AlumniList />} />
        
      </Route>
    </Routes>
  </BrowserRouter>
);
