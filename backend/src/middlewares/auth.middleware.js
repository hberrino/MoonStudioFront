import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (payload.rol !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid authorization token" });
  }
}
