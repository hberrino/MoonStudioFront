import { pool } from "../config/db.js";

export async function findDisponibilidadByProfesional(idProfesional) {
  const [rows] = await pool.query(
    `SELECT id, id_profesional, dia_semana, hora_inicio, hora_fin, intervalo_minutos
     FROM disponibilidad_profesional
     WHERE id_profesional = ?
     ORDER BY dia_semana`,
    [idProfesional],
  );
  return rows;
}

export async function upsertDisponibilidad({
  idProfesional,
  diaSemana,
  horaInicio,
  horaFin,
  intervaloMinutos,
}) {
  await pool.query(
    `INSERT INTO disponibilidad_profesional
      (id_profesional, dia_semana, hora_inicio, hora_fin, intervalo_minutos)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      hora_inicio = VALUES(hora_inicio),
      hora_fin = VALUES(hora_fin),
      intervalo_minutos = VALUES(intervalo_minutos)`,
    [idProfesional, diaSemana, horaInicio, horaFin, intervaloMinutos],
  );

  const [rows] = await pool.query(
    `SELECT id, id_profesional, dia_semana, hora_inicio, hora_fin, intervalo_minutos
     FROM disponibilidad_profesional
     WHERE id_profesional = ? AND dia_semana = ?`,
    [idProfesional, diaSemana],
  );
  return rows[0] || null;
}

export async function deleteDisponibilidad(idProfesional, diaSemana) {
  const [result] = await pool.query(
    "DELETE FROM disponibilidad_profesional WHERE id_profesional = ? AND dia_semana = ?",
    [idProfesional, diaSemana],
  );
  return result.affectedRows > 0;
}

export async function findDisponibilidadForDate(idProfesional, diaSemana) {
  const [rows] = await pool.query(
    `SELECT id, id_profesional, dia_semana, hora_inicio, hora_fin, intervalo_minutos
     FROM disponibilidad_profesional
     WHERE id_profesional = ? AND dia_semana = ?`,
    [idProfesional, diaSemana],
  );
  return rows[0] || null;
}

export async function findTurnosOcupados(idProfesional, fecha) {
  const [rows] = await pool.query(
    `SELECT hora, hora_fin
     FROM turnos
     WHERE id_profesional = ? AND fecha = ? AND estado <> 'cancelado'`,
    [idProfesional, fecha],
  );
  return rows.map((row) => ({
    hora: String(row.hora).slice(0, 5),
    horaFin: row.hora_fin ? String(row.hora_fin).slice(0, 5) : null,
  }));
}
