import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class PlanMejoramientoAuditorDto {
  @ApiProperty()
  readonly plan_mejoramiento_id: Types.ObjectId;

  @ApiProperty()
  readonly auditor_id: number;

  @ApiProperty()
  readonly asignado: boolean;

  @ApiProperty()
  readonly asignado_por_id: number;

  @ApiProperty()
  readonly auditor_lider: boolean;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
