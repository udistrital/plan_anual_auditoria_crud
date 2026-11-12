import { Types } from 'mongoose';
import { ComentarioAccionDto } from '../../src/comentario-accion/dto/comentario-accion.dto';

export const ACCION_ID = '672d3050f7814a9a0c5261d4';
export const COMENTARIO_ID = '672d36737e962bcac5ce9beb';

/** DTO de un comentario del foro de una acción de mejora. */
export function crearComentarioDto(
  cambios: Partial<ComentarioAccionDto> = {},
): ComentarioAccionDto {
  return {
    accion_mejora_id: new Types.ObjectId(ACCION_ID),
    mensaje: 'Pendiente remitir el anexo de firmas de las actas.',
    usuario_id: 101,
    usuario_rol: 'AUDITOR',
    activo: true,
    fecha_creacion: new Date('2026-03-18T10:15:00Z'),
    fecha_modificacion: new Date('2026-03-18T10:15:00Z'),
    ...cambios,
  };
}

/** Comentario guardado (con _id), como lo devuelve el modelo. */
export function crearComentario(cambios: Partial<ComentarioAccionDto> = {}) {
  return { _id: COMENTARIO_ID, ...crearComentarioDto(cambios) };
}

export function crearAccion() {
  return { _id: ACCION_ID, no_accion: 'AM-001' };
}
