-- ============================================
-- Migración 003: Gestión de Equipo del Despacho
-- Tabla de invitaciones para agregar miembros
-- ============================================

-- Invitaciones para unirse al despacho
CREATE TABLE IF NOT EXISTS invitaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despacho_id UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'abogado' CHECK (rol IN ('admin', 'abogado', 'pasante', 'asistente')),
    invitado_por UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'expirada', 'cancelada')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitaciones_despacho ON invitaciones(despacho_id);
CREATE INDEX IF NOT EXISTS idx_invitaciones_email ON invitaciones(email);
CREATE INDEX IF NOT EXISTS idx_invitaciones_token ON invitaciones(token);
