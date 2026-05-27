import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { upsertAdminUsuario } from "../models/usuario.model.js";

if (!env.admin.password) {
  console.error("ADMIN_PASSWORD is required to seed the admin user.");
  process.exitCode = 1;
} else {
  const passwordHash = await bcrypt.hash(env.admin.password, 12);
  const usuario = await upsertAdminUsuario({
    nombre: env.admin.name,
    passwordHash,
  });

  console.log(`Admin user ready: ${usuario.nombre}`);
}

await pool.end();
