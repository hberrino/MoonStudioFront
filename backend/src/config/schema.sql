CREATE TABLE IF NOT EXISTS servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10, 2) NULL
);

CREATE TABLE IF NOT EXISTS profesionales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS profesional_servicio (
  id_profesional INT NOT NULL,
  id_servicio INT NOT NULL,
  PRIMARY KEY (id_profesional, id_servicio),
  CONSTRAINT fk_profesional_servicio_profesional
    FOREIGN KEY (id_profesional) REFERENCES profesionales(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_profesional_servicio_servicio
    FOREIGN KEY (id_servicio) REFERENCES servicios(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_cliente VARCHAR(255) NOT NULL,
  email_cliente VARCHAR(255) NOT NULL,
  telefono_cliente VARCHAR(50) NOT NULL,
  id_profesional INT NOT NULL,
  id_servicio INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado ENUM('pendiente', 'confirmado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_turnos_profesional
    FOREIGN KEY (id_profesional) REFERENCES profesionales(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_turnos_servicio
    FOREIGN KEY (id_servicio) REFERENCES servicios(id)
    ON DELETE RESTRICT,
  UNIQUE (id_profesional, fecha, hora)
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin') NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disponibilidad_profesional (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_profesional INT NOT NULL,
  dia_semana TINYINT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  intervalo_minutos INT NOT NULL DEFAULT 30,
  CONSTRAINT fk_disponibilidad_profesional
    FOREIGN KEY (id_profesional) REFERENCES profesionales(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_disponibilidad_dia
    CHECK (dia_semana BETWEEN 0 AND 6),
  CONSTRAINT chk_disponibilidad_intervalo
    CHECK (intervalo_minutos > 0),
  UNIQUE (id_profesional, dia_semana)
);

CREATE TABLE IF NOT EXISTS bloqueos_profesional (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_profesional INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  motivo VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bloqueos_profesional
    FOREIGN KEY (id_profesional) REFERENCES profesionales(id)
    ON DELETE CASCADE
);
