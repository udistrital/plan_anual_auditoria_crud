import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CalificacionAccionDto {
  @ApiProperty()
  readonly accion_mejora_id: Types.ObjectId;

  @ApiProperty()
  readonly auditor_id: number;

  @ApiProperty()
  readonly criterio_evaluacion: number;

  @ApiProperty()
  readonly calificacion: number;

  @ApiProperty()
  readonly observacion: string;

  @ApiProperty()
  readonly fecha_calificacion: Date;

  @ApiProperty()
  readonly actual: boolean;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
