import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || "change_this_for_a_long_random_secret",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  admin: {
    name: process.env.ADMIN_NAME || "admin",
    password: process.env.ADMIN_PASSWORD || "",
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "moonstudio",
  },
};
