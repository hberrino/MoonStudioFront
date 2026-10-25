import { pool } from "../config/db.js";

try {
  const [columns] = await pool.query("SHOW COLUMNS FROM servicios LIKE 'eliminado'");
  if (columns.length === 0) {
    await pool.query(
      "ALTER TABLE servicios ADD COLUMN eliminado TINYINT(1) NOT NULL DEFAULT 0",
    );
  }
  console.log("Eliminacion de servicios: base de datos actualizada.");
} catch (error) {
  console.error("No se pudo actualizar la base de datos:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
