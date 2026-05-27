import { pool } from "../config/db.js";

export async function findAllServicios() {
  const [rows] = await pool.query("SELECT id, nombre, precio FROM servicios ORDER BY id");
  return rows;
}

export async function findServicioById(id) {
  const [rows] = await pool.query("SELECT id, nombre, precio FROM servicios WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function createServicio({ nombre, precio = null }) {
  const [result] = await pool.query("INSERT INTO servicios (nombre, precio) VALUES (?, ?)", [
    nombre,
    precio,
  ]);
  return findServicioById(result.insertId);
}

export async function updateServicio(id, { nombre, precio = null }) {
  const [result] = await pool.query("UPDATE servicios SET nombre = ?, precio = ? WHERE id = ?", [
    nombre,
    precio,
    id,
  ]);

  if (result.affectedRows === 0) return null;
  return findServicioById(id);
}

export async function deleteServicio(id) {
  const [result] = await pool.query("DELETE FROM servicios WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
