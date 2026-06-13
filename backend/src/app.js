import cors from "cors";
import express from "express";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import bloqueosRoutes from "./routes/bloqueos.routes.js";
import disponibilidadRoutes from "./routes/disponibilidad.routes.js";
import profesionalesRoutes from "./routes/profesionales.routes.js";
import serviciosRoutes from "./routes/servicios.routes.js";
import turnosRoutes from "./routes/turnos.routes.js";
import { env } from "./config/env.js";

const app = express();

app.disable("x-powered-by");

if (env.trustProxy > 0) {
  app.set("trust proxy", env.trustProxy);
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error("Origin not allowed by CORS");
      error.status = 403;
      return callback(error);
    },
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

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
  const status = Number(err.status) || 500;
  const message = status >= 500 && env.isProduction
    ? "Ocurrio un error interno. Intenta nuevamente."
    : err.message || "Internal server error";

  res.status(status).json({ message });
});

export default app;
