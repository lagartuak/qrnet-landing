-- ============================================================
--  QRnet.io · Migración de base de datos
--  Ejecutar en Aiven MySQL (defaultdb)
-- ============================================================

-- 1. Ampliar tabla qr_codes con tipo y datos del objeto
ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS object_type  VARCHAR(50)  DEFAULT 'generico' COMMENT 'maquina-tabaco, vehiculo, bicicleta, mascota, objeto',
  ADD COLUMN IF NOT EXISTS object_data  JSON         DEFAULT NULL       COMMENT 'Datos específicos del tipo de objeto',
  ADD COLUMN IF NOT EXISTS public_code  VARCHAR(20)  DEFAULT NULL       COMMENT 'Código público del QR (ej: TUD-001)',
  ADD COLUMN IF NOT EXISTS title        VARCHAR(200) DEFAULT NULL       COMMENT 'Nombre/título del objeto',
  ADD COLUMN IF NOT EXISTS is_active    TINYINT(1)   DEFAULT 1;

-- Índice para búsqueda pública por código
ALTER TABLE qr_codes
  ADD UNIQUE INDEX IF NOT EXISTS idx_public_code (public_code);

-- 2. Tabla de incidencias vinculadas a QR codes
CREATE TABLE IF NOT EXISTS qr_incidencias (
  id          INT(11)      NOT NULL AUTO_INCREMENT,
  qr_code_id  INT(11)      NOT NULL,
  fecha       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descripcion TEXT         NOT NULL,
  estado      ENUM('abierta','en_proceso','resuelta') NOT NULL DEFAULT 'abierta',
  canal       ENUM('whatsapp','email','web') DEFAULT 'whatsapp',
  notas       TEXT         DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_qr_code (qr_code_id),
  CONSTRAINT fk_inc_qr FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Estructura del campo object_data según tipo:
--
-- maquina-tabaco: {
--   estab_nombre, estab_dir, estab_cp, estab_ciudad,
--   tel_resp, fabricante, modelo, num_serie,
--   fecha_inst, pvr_caducidad, planograma_url
-- }
--
-- vehiculo: {
--   matricula, bastidor, marca, modelo, color,
--   año, propietario, tel_resp, seguro_cia,
--   seguro_vencimiento, observaciones
-- }
--
-- bicicleta: {
--   marca, modelo, color, num_serie, tipo,
--   propietario, tel_resp, recompensa, observaciones
-- }
--
-- mascota: {
--   nombre, especie, raza, color, microchip,
--   propietario, tel_resp, veterinario,
--   alergias, medicacion, observaciones
-- }
--
-- objeto: {
--   descripcion, propietario, tel_resp,
--   recompensa, observaciones
-- }
-- ============================================================
