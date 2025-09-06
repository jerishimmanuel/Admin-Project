import axios from "axios";
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
export function authHeader(){ const token = localStorage.getItem("token"); return token ? { Authorization: `Bearer ${token}` } : {}; }
export const api = axios.create({ baseURL: API_BASE });
