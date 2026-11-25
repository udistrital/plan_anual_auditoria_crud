import { Types } from 'mongoose';
import { AuditoriaExternaEstadoDto } from '../../src/auditoria-externa-estado/dto/auditoria-externa-estado.dto';
import { AUDITORIA_EXTERNA_ID } from './auditoria-externa';

export const ESTADO_EXTERNA_ID = '672d4b22f7814a9a0c5261e2';

/** DTO de un estado de auditoría externa. */
export function crearEstadoExternaDto(
  cambios: Partial<AuditoriaExternaEstadoDto> = {},
): AuditoriaExternaEstadoDto {
  return {
    auditoria_externa_id: new Types.ObjectId(AUDITORIA_EXTERNA_ID),
    usuario_id: 101,
    usuario_rol: 'AUDITOR',
    observacion: 'Registro de la auditoría externa',
    estado_id: 7500,
    actual: true,
    fecha_ejecucion_estado: new Date('2026-03-18T10:15:00Z'),
    activo: true,
    ...cambios,
  };
}

/** Estado guardado (con _id), como lo devuelve el modelo. */
export function crearEstadoExterna(
  cambios: Partial<AuditoriaExternaEstadoDto> = {},
) {
  return { _id: ESTADO_EXTERNA_ID, ...crearEstadoExternaDto(cambios) };
}
