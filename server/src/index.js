import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import alumniRoutes from "./routes/alumni.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CLIENT_ORIGIN?.split(",") || "*", credentials: true }
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "*", credentials: true }));
app.use(express.json());
app.get("/", (_, res) =>
  res.send(`
    <html>
      <head>
        <title>Alumni Portal API</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f9fafb; color: #222; text-align: center; margin-top: 10vh; }
          h1 { color: #2d6cdf; }
          .info { margin: 2em auto; padding: 1em 2em; background: #fff; border-radius: 8px; display: inline-block; box-shadow: 0 2px 8px #0001; }
          code { background: #f3f3f3; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="info">
          <h1>🎓 Alumni Portal API</h1>
          <p>Status: <b>Running</b></p>
          <p>Try <code>/api/auth</code>, <code>/api/alumni</code>, <code>/api/chat</code></p>
          <p><small>&copy; ${new Date().getFullYear()} Alumni Portal</small></p>
        </div>
      </body>
    </html>
  `)
);

app.get("/health", (_, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use("/api/auth", authRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/chat", chatRoutes);

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); 
  });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Alumni Portal API running at: http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready at: ws://localhost:${PORT}`);
    console.log("Press Ctrl+C to stop.\n");
  });
}).catch((err) => {
  console.error("❌ Failed to connect to DB:", err);
  process.exit(1);
});