-- ============================================
-- Verioska: Centro de Mando Procesal Penal
-- Schema PostgreSQL v1.0
-- Fecha: 2026-03-07
-- ============================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pgvector se habilitara en Phase 3 (RAG juridico)
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- TABLAS BASE
-- ============================================

-- Despachos (debe existir antes que users por FK)
CREATE TABLE despachos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usuarios (abogados, pasantes, asistentes)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    cedula_profesional VARCHAR(50),
    telefono VARCHAR(20),
    despacho_id UUID REFERENCES despachos(id) ON DELETE SET NULL,
    rol VARCHAR(20) DEFAULT 'abogado' CHECK (rol IN ('admin', 'abogado', 'pasante', 'asistente')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTES
-- ============================================

CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255),
    tipo_documento VARCHAR(20),
    numero_documento VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    estado VARCHAR(20) DEFAULT 'activo',
    fuente VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXPEDIENTES (el corazon del sistema)
-- ============================================

CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    despacho_id UUID REFERENCES despachos(id),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    -- Identificadores del caso
    nuc VARCHAR(100),                    -- Numero Unico de Causa
    carpeta_investigacion VARCHAR(100),  -- Numero de Carpeta de Investigacion
    causa_penal VARCHAR(100),            -- Numero de Causa Penal (ya judicializado)
    -- Datos del caso
    delito VARCHAR(255) NOT NULL,
    juzgado VARCHAR(255),
    distrito_judicial VARCHAR(255),
    fiscalia VARCHAR(255),
    -- Etapa procesal actual
    etapa_procesal VARCHAR(50) NOT NULL DEFAULT 'investigacion_inicial' CHECK (etapa_procesal IN (
        'investigacion_inicial',
        'investigacion_complementaria',
        'intermedia',
        'juicio_oral',
        'ejecucion',
        'amparo',
        'apelacion'
    )),
    -- Fechas clave para motor de plazos
    fecha_hechos TIMESTAMPTZ,
    fecha_detencion TIMESTAMPTZ,
    fecha_puesta_disposicion TIMESTAMPTZ,
    fecha_formulacion TIMESTAMPTZ,
    fecha_vinculacion TIMESTAMPTZ,
    fecha_cierre_complementaria TIMESTAMPTZ,
    -- Duplicidad de termino (48h -> 96h o 72h -> 144h)
    duplicidad_termino BOOLEAN DEFAULT FALSE,
    -- Estado del expediente
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'archivado', 'cerrado')),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTES PROCESALES
-- ============================================

CREATE TABLE partes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
        'imputado',
        'victima',
        'testigo',
        'perito',
        'ministerio_publico',
        'defensor',
        'asesor_juridico',
        'juez',
        'policia'
    )),
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255),
    alias VARCHAR(100),
    edad INT,
    genero VARCHAR(20),
    datos_contacto JSONB DEFAULT '{}',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLAZOS PROCESALES (motor CNPP)
-- ============================================

CREATE TABLE plazos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    -- Tipo de plazo segun CNPP
    tipo_plazo VARCHAR(80) NOT NULL,
    -- Ejemplos:
    --   'retencion_mp_48h'
    --   'retencion_mp_96h' (duplicidad)
    --   'termino_constitucional_72h'
    --   'termino_constitucional_144h' (duplicidad)
    --   'cierre_investigacion_complementaria'
    --   'apelacion_3d'
    --   'amparo_indirecto_15d'
    --   'recurso_revocacion'
    --   'custom'
    fundamento_legal VARCHAR(255),       -- Ej: "Art. 16 CPEUM", "Art. 313 CNPP"
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_limite TIMESTAMPTZ NOT NULL,
    horas_totales INT,                   -- Para plazos en horas (48, 72, 144)
    dias_totales INT,                    -- Para plazos en dias
    dias_habiles BOOLEAN DEFAULT FALSE,  -- TRUE si cuenta solo dias habiles
    -- Semaforo
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN (
        'activo',      -- corriendo
        'proximo',     -- menos de 25% del tiempo restante
        'critico',     -- menos de 10% o ultimas 6 horas
        'vencido',     -- se paso la fecha limite
        'cumplido',    -- se cumplio a tiempo
        'cancelado'    -- ya no aplica
    )),
    -- Alertas
    alerta_enviada_email BOOLEAN DEFAULT FALSE,
    alerta_enviada_whatsapp BOOLEAN DEFAULT FALSE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIENCIAS
-- ============================================

CREATE TABLE audiencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo_audiencia VARCHAR(60) NOT NULL CHECK (tipo_audiencia IN (
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
        'otra'
    )),
    fecha_programada TIMESTAMPTZ NOT NULL,
    fecha_realizada TIMESTAMPTZ,
    sala VARCHAR(100),
    juzgado VARCHAR(255),
    juez VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN (
        'programada', 'realizada', 'diferida', 'cancelada', 'suspendida'
    )),
    resultado TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENTOS (carpeta de investigacion)
-- ============================================

CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(500) NOT NULL,
    tipo_archivo VARCHAR(20) NOT NULL CHECK (tipo_archivo IN (
        'pdf', 'imagen', 'audio', 'video', 'otro'
    )),
    tipo_documento VARCHAR(60) CHECK (tipo_documento IN (
        'declaracion_ministerial',
        'declaracion_judicial',
        'ampliacion_declaracion',
        'peritaje',
        'dictamen',
        'acta_circunstanciada',
        'informe_policial',
        'cadena_custodia',
        'constancia',
        'acuerdo_juez',
        'fotografia_evidencia',
        'audio_audiencia',
        'video_audiencia',
        'otro'
    )),
    -- A que etapa pertenece
    etapa_procesal VARCHAR(50) CHECK (etapa_procesal IN (
        'investigacion_inicial',
        'investigacion_complementaria',
        'intermedia',
        'juicio_oral',
        'ejecucion',
        'amparo',
        'apelacion'
    )),
    ruta_archivo TEXT NOT NULL,
    tamano_bytes BIGINT,
    -- Procesamiento
    procesado BOOLEAN DEFAULT FALSE,
    texto_extraido TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HECHOS EXTRAIDOS
-- ============================================

CREATE TABLE hechos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
    descripcion TEXT NOT NULL,
    fecha_hecho TIMESTAMPTZ,
    lugar VARCHAR(500),
    relevancia VARCHAR(20) DEFAULT 'media' CHECK (relevancia IN ('critica', 'alta', 'media', 'baja')),
    verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DECLARACIONES
-- ============================================

CREATE TABLE declaraciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
    parte_id UUID REFERENCES partes(id) ON DELETE SET NULL,
    contenido TEXT NOT NULL,
    fecha_declaracion TIMESTAMPTZ,
    tipo VARCHAR(30) CHECK (tipo IN (
        'ministerial', 'judicial', 'ampliacion', 'careo', 'informativa', 'pericial'
    )),
    contexto TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CRONOLOGIA (linea del tiempo)
-- ============================================

CREATE TABLE cronologia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    fecha_evento TIMESTAMPTZ NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_evento VARCHAR(30) CHECK (tipo_evento IN (
        'hecho', 'procesal', 'probatorio', 'declaracion', 'audiencia', 'plazo'
    )),
    documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
    generado_por VARCHAR(10) DEFAULT 'manual' CHECK (generado_por IN ('manual', 'ia')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTRADICCIONES DETECTADAS
-- ============================================

CREATE TABLE contradicciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    declaracion_a_id UUID NOT NULL REFERENCES declaraciones(id) ON DELETE CASCADE,
    declaracion_b_id UUID NOT NULL REFERENCES declaraciones(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    tema VARCHAR(100),
    severidad VARCHAR(20) DEFAULT 'media' CHECK (severidad IN ('critica', 'alta', 'media', 'baja')),
    utilidad_defensiva TEXT,
    revisada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ESTRATEGIAS SUGERIDAS POR IA
-- ============================================

CREATE TABLE estrategias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo VARCHAR(30) CHECK (tipo IN ('defensiva', 'probatoria', 'procesal', 'negociacion')),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fundamento_legal TEXT,
    articulos_cnpp TEXT,
    confianza DECIMAL(3,2) CHECK (confianza BETWEEN 0 AND 1),
    aceptada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ESCRITOS GENERADOS
-- ============================================

CREATE TABLE escritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo_escrito VARCHAR(60) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    version INT DEFAULT 1,
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'revisado', 'finalizado')),
    ruta_pdf TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAGOS
-- ============================================

CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE SET NULL,
    monto DECIMAL(12,2) NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pagado', 'pendiente', 'anulado')),
    fecha_pago TIMESTAMPTZ,
    fecha_vencimiento TIMESTAMPTZ,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMBEDDINGS PARA RAG JURIDICO (Phase 3)
-- Se creara cuando se habilite pgvector
-- ============================================

-- ============================================
-- INDICES
-- ============================================

-- Users
CREATE INDEX idx_users_despacho ON users(despacho_id);
CREATE INDEX idx_users_email ON users(email);

-- Expedientes
CREATE INDEX idx_expedientes_user ON expedientes(user_id);
CREATE INDEX idx_expedientes_despacho ON expedientes(despacho_id);
CREATE INDEX idx_expedientes_estado ON expedientes(estado);
CREATE INDEX idx_expedientes_etapa ON expedientes(etapa_procesal);
CREATE INDEX idx_expedientes_nuc ON expedientes(nuc);

-- Plazos (critico para rendimiento del motor)
CREATE INDEX idx_plazos_expediente ON plazos(expediente_id);
CREATE INDEX idx_plazos_estado ON plazos(estado);
CREATE INDEX idx_plazos_fecha_limite ON plazos(fecha_limite);
CREATE INDEX idx_plazos_estado_fecha ON plazos(estado, fecha_limite);

-- Audiencias
CREATE INDEX idx_audiencias_expediente ON audiencias(expediente_id);
CREATE INDEX idx_audiencias_fecha ON audiencias(fecha_programada);
CREATE INDEX idx_audiencias_estado ON audiencias(estado);

-- Documentos
CREATE INDEX idx_documentos_expediente ON documentos(expediente_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX idx_documentos_etapa ON documentos(etapa_procesal);

-- Declaraciones
CREATE INDEX idx_declaraciones_expediente ON declaraciones(expediente_id);
CREATE INDEX idx_declaraciones_parte ON declaraciones(parte_id);

-- Cronologia
CREATE INDEX idx_cronologia_expediente_fecha ON cronologia(expediente_id, fecha_evento);

-- Contradicciones
CREATE INDEX idx_contradicciones_expediente ON contradicciones(expediente_id);

-- Embeddings (Phase 3)
-- CREATE INDEX idx_embeddings_expediente ON embeddings(expediente_id);
-- CREATE INDEX idx_embeddings_documento ON embeddings(documento_id);
-- CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
