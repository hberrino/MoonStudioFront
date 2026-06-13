import { pool } from "../config/db.js";

export async function findAllProfesionales() {
  const [rows] = await pool.query("SELECT id, nombre FROM profesionales ORDER BY id");
  return rows;
}

export async function findProfesionalById(id) {
  const [rows] = await pool.query("SELECT id, nombre FROM profesionales WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function createProfesional({ nombre }) {
  const [result] = await pool.query("INSERT INTO profesionales (nombre) VALUES (?)", [nombre]);
  return findProfesionalById(result.insertId);
}

export async function updateProfesional(id, { nombre }) {
  const [result] = await pool.query("UPDATE profesionales SET nombre = ? WHERE id = ?", [
    nombre,
    id,
  ]);

  if (result.affectedRows === 0) return null;
  return findProfesionalById(id);
}

export async function deleteProfesional(id) {
  const [result] = await pool.query("DELETE FROM profesionales WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function findServiciosByProfesional(idProfesional) {
  const [rows] = await pool.query(
    `SELECT s.id, s.nombre, s.precio
     FROM servicios s
     INNER JOIN profesional_servicio ps ON ps.id_servicio = s.id
     WHERE ps.id_profesional = ?
     ORDER BY s.id`,
    [idProfesional],
  );
  return rows;
}

export async function hasServicioAsignado(idProfesional, idServicio) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM profesional_servicio
     WHERE id_profesional = ? AND id_servicio = ?
     LIMIT 1`,
    [idProfesional, idServicio],
  );
  return rows.length > 0;
}

export async function replaceServiciosForProfesional(idProfesional, servicioIds = []) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM profesional_servicio WHERE id_profesional = ?", [
      idProfesional,
    ]);

    if (servicioIds.length > 0) {
      const values = servicioIds.map((idServicio) => [idProfesional, idServicio]);
      await connection.query(
        "INSERT INTO profesional_servicio (id_profesional, id_servicio) VALUES ?",
        [values],
      );
    }

    await connection.commit();
    return findServiciosByProfesional(idProfesional);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
