import { pool } from "../config/db.js";

export async function findAllServicios() {
  const [rows] = await pool.query(
    `SELECT id, nombre, seccion, precio_tipo, precio_min, precio_max, precio_min AS precio
     FROM servicios
     WHERE eliminado = 0
     ORDER BY id`,
  );
  return rows;
}

export async function findServicioById(id) {
  const [rows] = await pool.query(
    `SELECT id, nombre, seccion, precio_tipo, precio_min, precio_max, precio_min AS precio
     FROM servicios
     WHERE id = ? AND eliminado = 0`,
    [id],
  );
  return rows[0] || null;
}

export async function createServicio({
  nombre,
  seccion = "peluqueria",
  precioTipo = "consultar",
  precioMin = null,
  precioMax = null,
}) {
  const [result] = await pool.query(
    `INSERT INTO servicios (nombre, seccion, precio_tipo, precio_min, precio_max)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, seccion, precioTipo, precioMin, precioMax],
  );
  return findServicioById(result.insertId);
}

export async function updateServicio(
  id,
  { nombre, seccion = "peluqueria", precioTipo = "consultar", precioMin = null, precioMax = null },
) {
  const [result] = await pool.query(
    `UPDATE servicios
     SET nombre = ?, seccion = ?, precio_tipo = ?, precio_min = ?, precio_max = ?
     WHERE id = ? AND eliminado = 0`,
    [nombre, seccion, precioTipo, precioMin, precioMax, id],
  );

  if (result.affectedRows === 0) return null;
  return findServicioById(id);
}

export async function deleteServicio(id) {
  // Keep the row and its references so existing bookings retain their details.
  const [result] = await pool.query(
    "UPDATE servicios SET eliminado = 1 WHERE id = ? AND eliminado = 0",
    [id],
  );
  return result.affectedRows > 0;
}
