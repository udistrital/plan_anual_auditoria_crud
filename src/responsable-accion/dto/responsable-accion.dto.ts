import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class ResponsableAccionDto {
  @ApiProperty()
  readonly accion_mejora_id: Types.ObjectId;

  @ApiProperty()
  readonly dependencia_id: number;

  @ApiProperty()
  readonly dependencia_lider: boolean;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
