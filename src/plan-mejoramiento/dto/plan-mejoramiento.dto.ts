import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class PlanMejoramientoDto {
  @ApiProperty()
  readonly auditoria_id: Types.ObjectId;

  @ApiProperty()
  readonly vigencia_id: number;

  @ApiProperty()
  readonly tipo_evaluacion_id: number;

  @ApiProperty()
  readonly fecha_apertura: Date;

  @ApiProperty()
  readonly fecha_limite: Date;

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
