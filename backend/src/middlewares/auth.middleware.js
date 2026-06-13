import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
      audience: "moonstudio-admin",
      issuer: "moonstudio-api",
    });

    if (payload.rol !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "La sesion no es valida o vencio." });
  }
}
