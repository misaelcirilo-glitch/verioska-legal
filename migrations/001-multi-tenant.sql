-- ============================================
-- Migración 001: Multi-Tenant (País + Despacho)
-- Fecha: 2026-03-13
-- PRP-003: Soporte México + Perú
-- ============================================

-- 1. Agregar país a despachos
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS pais VARCHAR(2) NOT NULL DEFAULT 'MX';
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS ruc VARCHAR(20); -- RUC peruano
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS rfc VARCHAR(20); -- RFC mexicano
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'basico' CHECK (plan IN ('basico', 'profesional', 'enterprise'));

-- 2. Agregar país al expediente (hereda del despacho pero se guarda para queries rápidos)
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS pais VARCHAR(2) NOT NULL DEFAULT 'MX';

-- 3. Flexibilizar etapa_procesal (cada país tiene etapas distintas)
ALTER TABLE expedientes DROP CONSTRAINT IF EXISTS expedientes_etapa_procesal_check;
ALTER TABLE expedientes ADD CONSTRAINT expedientes_etapa_procesal_check CHECK (etapa_procesal IN (
    -- México (CNPP)
    'investigacion_inicial',
    'investigacion_complementaria',
    'intermedia',
    'juicio_oral',
    'ejecucion',
    'amparo',
    'apelacion',
    -- Perú (NCPP)
    'diligencias_preliminares',
    'investigacion_preparatoria',
    'etapa_intermedia',
    'juzgamiento',
    'impugnacion',
    'casacion',
    'proceso_inmediato'
));

-- 4. Agregar campos peruanos al expediente
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS numero_carpeta_fiscal VARCHAR(100); -- Perú
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS numero_expediente_judicial VARCHAR(100); -- Perú
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS fecha_denuncia TIMESTAMPTZ;
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS fecha_formalizacion TIMESTAMPTZ; -- Formalización inv. preparatoria
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS fecha_acusacion TIMESTAMPTZ;
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS fecha_auto_enjuiciamiento TIMESTAMPTZ;
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS complejidad VARCHAR(20) DEFAULT 'simple' CHECK (complejidad IN ('simple', 'complejo', 'crimen_organizado'));

-- 5. Flexibilizar tipo_audiencia para ambos países
ALTER TABLE audiencias DROP CONSTRAINT IF EXISTS audiencias_tipo_audiencia_check;
ALTER TABLE audiencias ADD CONSTRAINT audiencias_tipo_audiencia_check CHECK (tipo_audiencia IN (
    -- México
    'control_detencion',
    'formulacion_imputacion',
    'vinculacion_proceso',
    'medidas_cautelares',
    'plazo_cierre_investigacion',
    'intermedia',
    'juicio_oral',
    'individualizacion_sancion',
    'ejecucion',
    'amparo',
    'apelacion',
    -- Perú
    'control_identidad',
    'detencion_preliminar',
    'prision_preventiva',
    'prolongacion_prision',
    'cesacion_prision',
    'tutela_derechos',
    'control_plazo',
    'principio_oportunidad',
    'acuerdo_reparatorio',
    'terminacion_anticipada',
    'control_acusacion',
    'proceso_inmediato',
    'lectura_sentencia',
    'casacion',
    -- Común
    'otra'
));

-- 6. Flexibilizar partes para ambos países
ALTER TABLE partes DROP CONSTRAINT IF EXISTS partes_tipo_check;
ALTER TABLE partes ADD CONSTRAINT partes_tipo_check CHECK (tipo IN (
    'imputado', 'victima', 'testigo', 'perito',
    'ministerio_publico', 'defensor', 'asesor_juridico',
    'juez', 'policia',
    -- Perú
    'fiscal', 'procurador_publico', 'actor_civil', 'tercero_civil',
    'agraviado', 'abogado_defensor'
));

-- 7. Flexibilizar etapa_procesal en documentos
ALTER TABLE documentos DROP CONSTRAINT IF EXISTS documentos_etapa_procesal_check;
ALTER TABLE documentos ADD CONSTRAINT documentos_etapa_procesal_check CHECK (etapa_procesal IN (
    'investigacion_inicial', 'investigacion_complementaria',
    'intermedia', 'juicio_oral', 'ejecucion', 'amparo', 'apelacion',
    'diligencias_preliminares', 'investigacion_preparatoria',
    'etapa_intermedia', 'juzgamiento', 'impugnacion', 'casacion'
));

-- 8. Mantener articulos_cnpp (compatible con ambos países, almacena artículos del código procesal correspondiente)

-- ============================================
-- TABLAS NUEVAS: CRM + FINANZAS
-- ============================================

-- 9. Clientes (CRM)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
    -- Datos personales
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255),
    tipo_documento VARCHAR(20) CHECK (tipo_documento IN ('dni', 'ce', 'pasaporte', 'ine', 'curp', 'ruc', 'rfc')),
    numero_documento VARCHAR(30),
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    -- Estado CRM
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('prospecto', 'activo', 'inactivo', 'archivado')),
    fuente VARCHAR(30) CHECK (fuente IN ('referido', 'web', 'redes_sociales', 'directorio', 'otro')),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Relación cliente-expediente
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;

-- 11. Cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE SET NULL,
    -- Desglose por tramos
    monto_total DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN' CHECK (moneda IN ('PEN', 'MXN', 'USD')),
    modelo_cobro VARCHAR(20) DEFAULT 'tramos' CHECK (modelo_cobro IN ('tramos', 'fijo', 'hora', 'exito', 'mixto')),
    desglose JSONB DEFAULT '[]',
    -- Ejemplo desglose:
    -- [
    --   {"etapa": "investigacion_preparatoria", "monto": 3000, "descripcion": "Investigación"},
    --   {"etapa": "etapa_intermedia", "monto": 2000, "descripcion": "Etapa intermedia"},
    --   {"etapa": "juzgamiento", "monto": 5000, "descripcion": "Juicio oral"},
    --   {"bonus": true, "monto": 3000, "descripcion": "Bonus por absolución"}
    -- ]
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida')),
    fecha_envio TIMESTAMPTZ,
    fecha_respuesta TIMESTAMPTZ,
    vigencia_dias INT DEFAULT 15,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE SET NULL,
    -- Pago
    monto DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN',
    concepto VARCHAR(255) NOT NULL,
    etapa_procesal VARCHAR(50), -- A qué etapa corresponde el pago
    metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('efectivo', 'transferencia', 'deposito', 'cheque', 'yape', 'plin', 'tarjeta', 'otro')),
    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'parcial', 'vencido', 'cancelado')),
    fecha_vencimiento TIMESTAMPTZ,
    fecha_pago TIMESTAMPTZ,
    comprobante VARCHAR(255), -- Número de recibo/factura
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Gastos por caso
CREATE TABLE IF NOT EXISTS gastos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    -- Gasto
    concepto VARCHAR(255) NOT NULL,
    categoria VARCHAR(30) CHECK (categoria IN ('peritaje', 'copias', 'movilidad', 'tasa_judicial', 'notarial', 'otros')),
    monto DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN',
    fecha_gasto TIMESTAMPTZ DEFAULT NOW(),
    comprobante VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES NUEVOS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_despachos_pais ON despachos(pais);
CREATE INDEX IF NOT EXISTS idx_expedientes_pais ON expedientes(pais);
CREATE INDEX IF NOT EXISTS idx_expedientes_cliente ON expedientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_despacho ON clientes(despacho_id);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_despacho ON cotizaciones(despacho_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_expediente ON pagos(expediente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_gastos_expediente ON gastos(expediente_id);
