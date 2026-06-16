ALTER TABLE servicios
  ADD COLUMN seccion ENUM('peluqueria', 'cejas_pestanas', 'manos_unas', 'podoestetica') NOT NULL DEFAULT 'peluqueria' AFTER nombre;
