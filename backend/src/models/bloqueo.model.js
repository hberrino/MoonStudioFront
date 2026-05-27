import { pool } from "../config/db.js";

export async function findBloqueosByProfesional(idProfesional) {
  const [rows] = await pool.query(
    `SELECT id, id_profesional, fecha, hora_inicio, hora_fin, motivo, created_at
     FROM bloqueos_profesional
     WHERE id_profesional = ?
     ORDER BY fecha DESC, hora_inicio DESC`,
    [idProfesional],
  );
  return rows;
}

export async function findBloqueosByProfesionalAndDate(idProfesional, fecha) {
  const [rows] = await pool.query(
    `SELECT id, id_profesional, fecha, hora_inicio, hora_fin, motivo
     FROM bloqueos_profesional
     WHERE id_profesional = ? AND fecha = ?
     ORDER BY hora_inicio`,
    [idProfesional, fecha],
  );
  return rows;
}

export async function createBloqueo({ idProfesional, fecha, horaInicio, horaFin, motivo = null }) {
  const [result] = await pool.query(
    `INSERT INTO bloqueos_profesional
      (id_profesional, fecha, hora_inicio, hora_fin, motivo)
     VALUES (?, ?, ?, ?, ?)`,
    [idProfesional, fecha, horaInicio, horaFin, motivo],
  );

  const [rows] = await pool.query(
    `SELECT id, id_profesional, fecha, hora_inicio, hora_fin, motivo, created_at
     FROM bloqueos_profesional
     WHERE id = ?`,
    [result.insertId],
  );
  return rows[0] || null;
}

export async function deleteBloqueo(id) {
  const [result] = await pool.query("DELETE FROM bloqueos_profesional WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
