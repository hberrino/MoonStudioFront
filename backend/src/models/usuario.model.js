import { pool } from "../config/db.js";

export async function findUsuarioByNombre(nombre) {
  const [rows] = await pool.query(
    "SELECT id, nombre, password_hash, rol FROM usuarios WHERE nombre = ?",
    [nombre],
  );
  return rows[0] || null;
}

export async function upsertAdminUsuario({ nombre, passwordHash }) {
  await pool.query(
    `INSERT INTO usuarios (nombre, password_hash, rol)
     VALUES (?, ?, 'admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), rol = 'admin'`,
    [nombre, passwordHash],
  );

  return findUsuarioByNombre(nombre);
}
