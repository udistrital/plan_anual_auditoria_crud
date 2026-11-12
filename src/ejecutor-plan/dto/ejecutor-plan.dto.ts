import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class EjecutorPlanDto {
  @ApiProperty({ description: 'Referencia a ejecutor_dependencia._id' })
  readonly ejecutor_dependencia_id: Types.ObjectId;

  @ApiProperty({ description: 'Referencia a plan_mejoramiento._id' })
  readonly plan_mejoramiento_id: Types.ObjectId;

  @ApiProperty({ required: false, description: 'Usuario que asigna el plan' })
  readonly asignado_por_id?: number;

  @ApiProperty({ required: false, description: 'Marca la asignación vigente' })
  actual?: boolean;

  @ApiProperty({ required: false })
  activo?: boolean;

  @ApiProperty({ required: false })
  fecha_asignacion?: Date;

  @ApiProperty({ required: false })
  fecha_creacion?: Date;

  @ApiProperty({ required: false })
  fecha_modificacion?: Date;
}
