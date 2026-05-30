import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import bloqueosRoutes from "./routes/bloqueos.routes.js";
import disponibilidadRoutes from "./routes/disponibilidad.routes.js";
import profesionalesRoutes from "./routes/profesionales.routes.js";
import serviciosRoutes from "./routes/servicios.routes.js";
import turnosRoutes from "./routes/turnos.routes.js";
import { env } from "./config/env.js";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/bloqueos", bloqueosRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/profesionales", profesionalesRoutes);
app.use("/api/disponibilidad", disponibilidadRoutes);
app.use("/api/turnos", turnosRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
