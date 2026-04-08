-- ========================================
-- PRP-005 Configuración
-- Tablas: preferencias, plantillas, accesos, integraciones
-- ========================================

-- Preferencias por usuario
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    idioma VARCHAR(5) NOT NULL DEFAULT 'es',          -- es, en
    formato_fecha VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
    zona_horaria VARCHAR(50) NOT NULL DEFAULT 'America/Lima',
    tema VARCHAR(10) NOT NULL DEFAULT 'light',        -- light, dark
    notif_audiencias BOOLEAN DEFAULT true,
    notif_plazos BOOLEAN DEFAULT true,
    notif_sistema BOOLEAN DEFAULT true,
    notif_email BOOLEAN DEFAULT true,
    notif_frecuencia VARCHAR(20) DEFAULT 'inmediata', -- inmediata, diaria, semanal
    twofa_enabled BOOLEAN DEFAULT false,
    twofa_secret VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plantillas de escritos legales del despacho
CREATE TABLE IF NOT EXISTS plantillas_despacho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    despacho_id UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL,                   -- escrito, demanda, contestacion, recurso, otro
    descripcion TEXT,
    contenido TEXT NOT NULL,                          -- markdown/html con placeholders {{cliente}}, {{expediente}}, etc.
    variables JSONB DEFAULT '[]',                     -- ['cliente', 'expediente_numero', ...]
    creado_por UUID REFERENCES users(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plantillas_despacho ON plantillas_despacho(despacho_id);
CREATE INDEX IF NOT EXISTS idx_plantillas_categoria ON plantillas_despacho(despacho_id, categoria);

-- Registro de accesos (login, logout, intentos fallidos)
CREATE TABLE IF NOT EXISTS accesos_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    tipo VARCHAR(20) NOT NULL,                        -- login_ok, login_fail, logout, password_change
    ip VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accesos_user ON accesos_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_accesos_tipo ON accesos_log(tipo, created_at DESC);

-- Integraciones por despacho (SMTP, Google Calendar, etc.)
CREATE TABLE IF NOT EXISTS integraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    despacho_id UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL,                        -- smtp, google_calendar, outlook, drive
    nombre VARCHAR(100),
    config JSONB NOT NULL DEFAULT '{}',               -- credenciales encriptadas/tokens
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_integraciones_unique ON integraciones(despacho_id, tipo);
