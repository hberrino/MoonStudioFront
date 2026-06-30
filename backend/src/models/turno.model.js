import { pool } from "../config/db.js";

const turnoSelect = `
  SELECT
    t.id,
    t.nombre_cliente,
    t.email_cliente,
    t.telefono_cliente,
    t.id_profesional,
    p.nombre AS profesional_nombre,
    t.id_servicio,
    s.nombre AS servicio_nombre,
    s.seccion AS servicio_seccion,
    s.precio_tipo AS servicio_precio_tipo,
    s.precio_min AS servicio_precio_min,
    s.precio_max AS servicio_precio_max,
    s.precio_min AS servicio_precio,
    t.fecha,
    t.hora,
    t.hora_fin,
    t.estado,
    t.created_at
  FROM turnos t
  INNER JOIN profesionales p ON p.id = t.id_profesional
  INNER JOIN servicios s ON s.id = t.id_servicio
`;

export async function findAllTurnos() {
  const [rows] = await pool.query(`${turnoSelect} ORDER BY t.fecha DESC, t.hora DESC`);
  return rows;
}

export async function findTurnoById(id) {
  const [rows] = await pool.query(`${turnoSelect} WHERE t.id = ?`, [id]);
  return rows[0] || null;
}

export async function createTurno({
  nombreCliente,
  emailCliente,
  telefonoCliente,
  idProfesional,
  idServicio,
  fecha,
  hora,
  horaFin = null,
}) {
  const [result] = await pool.query(
    `INSERT INTO turnos
      (nombre_cliente, email_cliente, telefono_cliente, id_profesional, id_servicio, fecha, hora, hora_fin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombreCliente, emailCliente, telefonoCliente, idProfesional, idServicio, fecha, hora, horaFin],
  );

  return findTurnoById(result.insertId);
}

export async function hasTurnoOverlap(idProfesional, fecha, horaInicio, horaFin) {
  const [rows] = await pool.query(
    `SELECT id
     FROM turnos
     WHERE id_profesional = ?
       AND fecha = ?
       AND estado <> 'cancelado'
       AND hora < ?
       AND COALESCE(hora_fin, ADDTIME(hora, '00:01:00')) > ?
     LIMIT 1`,
    [idProfesional, fecha, horaFin, horaInicio],
  );
  return rows.length > 0;
}

export async function updateTurnoEstado(id, estado) {
  const [result] = await pool.query("UPDATE turnos SET estado = ? WHERE id = ?", [estado, id]);

  if (result.affectedRows === 0) return null;
  return findTurnoById(id);
}

export async function deleteTurno(id) {
  const [result] = await pool.query("DELETE FROM turnos WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function deleteTurnosByProfesional(idProfesional) {
  const [result] = await pool.query("DELETE FROM turnos WHERE id_profesional = ?", [
    idProfesional,
  ]);
  return result.affectedRows;
}
