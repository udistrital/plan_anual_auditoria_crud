import { AuditoriaExternaDto } from '../../src/auditoria-externa/dto/auditoria-externa.dto';

export const AUDITORIA_EXTERNA_ID = '672d4a11f7814a9a0c5261e1';

/** DTO de una auditoría externa registrada por el auditor. */
export function crearAuditoriaExternaDto(
  cambios: Partial<AuditoriaExternaDto> = {},
): AuditoriaExternaDto {
  return {
    vigencia_id: 6772,
    codigo_entidad: 'CB-001',
    nombre_entidad: 'Contraloría de Bogotá',
    nombre_auditoria: 'Auditoría de regularidad PAD 2025',
    fecha_informe_final: new Date('2026-03-10T00:00:00Z'),
    dependencia_id: [101, 102],
    estado_id: 0,
    activo: true,
    fecha_creacion: new Date('2026-03-18T10:15:00Z'),
    fecha_modificacion: new Date('2026-03-18T10:15:00Z'),
    ...cambios,
  };
}

/** Auditoría externa guardada (con _id), como la devuelve el modelo. */
export function crearAuditoriaExterna(
  cambios: Partial<AuditoriaExternaDto> = {},
) {
  return { _id: AUDITORIA_EXTERNA_ID, ...crearAuditoriaExternaDto(cambios) };
}
