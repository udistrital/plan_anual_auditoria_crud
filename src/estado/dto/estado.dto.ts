import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class PlanEstadoDto {
  @ApiProperty()
  readonly plan_auditoria_id: Types.ObjectId;

  @ApiProperty()
  readonly usuario_id: number;

  @ApiProperty()
  readonly usuario_rol: string;

  @ApiProperty()
  readonly observacion: string;

  @ApiProperty()
  readonly actual: boolean;

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  readonly fecha_ejecucion_estado: Date;

  @ApiProperty()
  activo: boolean;
}
