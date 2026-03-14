-- ============================================
-- Migración 002: Cerebro Verioska (PRP-004)
-- Fecha: 2026-03-14
-- Módulos: Jurisprudencia, Dosificación, Interrogatorio, Cerebro IA
-- ============================================

-- 1. Tabla de dosificación de pena por expediente
CREATE TABLE IF NOT EXISTS dosificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    -- Datos del delito
    delito VARCHAR(255) NOT NULL,
    pais VARCHAR(2) NOT NULL DEFAULT 'MX',
    codigo_penal VARCHAR(50), -- CPF, CPCDMX, CP-PE, etc.
    articulo VARCHAR(50),
    -- Penas base
    pena_minima_meses INT NOT NULL,
    pena_maxima_meses INT NOT NULL,
    -- Factores
    agravantes JSONB DEFAULT '[]',   -- [{factor, fundamento, incremento_porcentaje}]
    atenuantes JSONB DEFAULT '[]',   -- [{factor, fundamento, reduccion_porcentaje}]
    -- Resultado
    pena_sugerida_meses INT,
    pena_multa_min DECIMAL(12,2),
    pena_multa_max DECIMAL(12,2),
    reparacion_danio BOOLEAN DEFAULT FALSE,
    sustitucion_posible BOOLEAN DEFAULT FALSE, -- Pena alternativa
    procedimiento_abreviado BOOLEAN DEFAULT FALSE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de planes de interrogatorio
CREATE TABLE IF NOT EXISTS interrogatorios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    parte_id UUID REFERENCES partes(id) ON DELETE SET NULL,
    -- Tipo y objetivo
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
        'examen_directo', 'contraexamen', 'reexamen',
        'redirect', 'declaracion_preparatoria'
    )),
    objetivo TEXT NOT NULL,
    -- Plan de preguntas
    preguntas JSONB NOT NULL DEFAULT '[]',
    -- [{orden, pregunta, tipo_pregunta (abierta|cerrada|sugestiva|de_control), proposito, nota}]
    tecnica VARCHAR(50), -- primacy_recency, looping, capitulos, etc.
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de conversaciones con Cerebro Verioska
CREATE TABLE IF NOT EXISTS cerebro_mensajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rol VARCHAR(10) NOT NULL CHECK (rol IN ('user', 'assistant')),
    contenido TEXT NOT NULL,
    fuentes JSONB DEFAULT '[]', -- [{tipo, nombre, fragmento}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_dosificaciones_expediente ON dosificaciones(expediente_id);
CREATE INDEX IF NOT EXISTS idx_interrogatorios_expediente ON interrogatorios(expediente_id);
CREATE INDEX IF NOT EXISTS idx_interrogatorios_parte ON interrogatorios(parte_id);
CREATE INDEX IF NOT EXISTS idx_cerebro_mensajes_expediente ON cerebro_mensajes(expediente_id);
CREATE INDEX IF NOT EXISTS idx_cerebro_mensajes_user ON cerebro_mensajes(user_id);
CREATE INDEX IF NOT EXISTS idx_cerebro_mensajes_created ON cerebro_mensajes(created_at);
