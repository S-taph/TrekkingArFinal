-- Script para agregar columnas faltantes a la tabla viajes
-- Ejecutar este script en la base de datos MySQL/MariaDB

USE trekking_ar;

-- Agregar maximo_participantes si no existe
ALTER TABLE viajes
ADD COLUMN IF NOT EXISTS maximo_participantes INT NULL
AFTER minimo_participantes;

-- Agregar incluye si no existe
ALTER TABLE viajes
ADD COLUMN IF NOT EXISTS incluye TEXT NULL
AFTER maximo_participantes;

-- Agregar no_incluye si no existe
ALTER TABLE viajes
ADD COLUMN IF NOT EXISTS no_incluye TEXT NULL
AFTER incluye;

-- Agregar recomendaciones si no existe
ALTER TABLE viajes
ADD COLUMN IF NOT EXISTS recomendaciones TEXT NULL
AFTER no_incluye;

-- Verificar las columnas agregadas
DESCRIBE viajes;
