import { Types } from 'mongoose';
import {
  AuditoriaExternaHallazgoDatosDto,
  AuditoriaExternaHallazgoDto,
  AuditoriaExternaHallazgoLoteDto,
} from '../../src/auditoria-externa-hallazgo/dto/auditoria-externa-hallazgo.dto';
import { AUDITORIA_EXTERNA_ID } from './auditoria-externa';

export const HALLAZGO_EXTERNO_ID = '672d4c33f7814a9a0c5261e3';

/** Datos propios de un hallazgo externo (sin auditoría ni trazabilidad). */
export function crearHallazgoExternoDatos(
  cambios: Partial<AuditoriaExternaHallazgoDatosDto> = {},
): AuditoriaExternaHallazgoDatosDto {
  return {
    vigencia_id: 6772,
    codigo_auditoria: '2025-0123',
    numeral: '3.1.1.1',
    descripcion: 'Deficiencias en la supervisión de contratos de obra.',
    dependencia_id: [101],
    ...cambios,
  };
}

/** DTO de un hallazgo externo. */
export function crearHallazgoExternoDto(
  cambios: Partial<AuditoriaExternaHallazgoDto> = {},
): AuditoriaExternaHallazgoDto {
  return {
    ...crearHallazgoExternoDatos(),
    auditoria_externa_id: new Types.ObjectId(AUDITORIA_EXTERNA_ID),
    activo: true,
    fecha_creacion: new Date('2026-03-18T10:15:00Z'),
    fecha_modificacion: new Date('2026-03-18T10:15:00Z'),
    ...cambios,
  };
}

/** Hallazgo guardado (con _id), como lo devuelve el modelo. */
export function crearHallazgoExterno(
  cambios: Partial<AuditoriaExternaHallazgoDto> = {},
) {
  return { _id: HALLAZGO_EXTERNO_ID, ...crearHallazgoExternoDto(cambios) };
}

/** Lote de hallazgos de una misma auditoría. */
export function crearLoteHallazgos(
  cantidad = 2,
): AuditoriaExternaHallazgoLoteDto {
  return {
    auditoria_externa_id: new Types.ObjectId(AUDITORIA_EXTERNA_ID),
    hallazgos: Array.from({ length: cantidad }, (_, i) =>
      crearHallazgoExternoDatos({ numeral: `3.1.1.${i + 1}` }),
    ),
  };
}
