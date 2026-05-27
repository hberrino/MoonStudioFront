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
    s.precio AS servicio_precio,
    t.fecha,
    t.hora,
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
}) {
  const [result] = await pool.query(
    `INSERT INTO turnos
      (nombre_cliente, email_cliente, telefono_cliente, id_profesional, id_servicio, fecha, hora)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombreCliente, emailCliente, telefonoCliente, idProfesional, idServicio, fecha, hora],
  );

  return findTurnoById(result.insertId);
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
