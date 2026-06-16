ALTER TABLE servicios
  ADD COLUMN precio_tipo ENUM('consultar', 'fijo', 'desde', 'rango') NOT NULL DEFAULT 'consultar' AFTER nombre,
  ADD COLUMN precio_min DECIMAL(10, 2) NULL AFTER precio_tipo,
  ADD COLUMN precio_max DECIMAL(10, 2) NULL AFTER precio_min;

UPDATE servicios
SET
  precio_tipo = CASE WHEN precio IS NULL THEN 'consultar' ELSE 'fijo' END,
  precio_min = precio,
  precio_max = NULL;

ALTER TABLE servicios
  DROP COLUMN precio;
