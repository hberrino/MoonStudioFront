import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required${isProduction ? " in production" : ""}.`);
  }

  return value;
}

function parseOrigins(value) {
  return String(value || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const jwtSecret = process.env.JWT_SECRET?.trim() || "";

if (isProduction && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters in production.");
}

export const env = {
  nodeEnv,
  isProduction,
  host: process.env.HOST || (isProduction ? "127.0.0.1" : "0.0.0.0"),
  port: Number(process.env.PORT) || 3001,
  trustProxy: Number(process.env.TRUST_PROXY || (isProduction ? 1 : 0)),
  jwtSecret: jwtSecret || "development_only_change_me_before_production",
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN),
  admin: {
    name: process.env.ADMIN_NAME || "admin",
    password: process.env.ADMIN_PASSWORD || "",
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY?.trim() || "",
    from: process.env.EMAIL_FROM?.trim() || "Moon Studio <turnos@moonstudio.com.ar>",
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: isProduction ? getRequiredEnv("DB_USER") : process.env.DB_USER || "root",
    password: isProduction ? getRequiredEnv("DB_PASSWORD") : process.env.DB_PASSWORD || "",
    database: isProduction ? getRequiredEnv("DB_NAME") : process.env.DB_NAME || "moonstudio",
  },
};
