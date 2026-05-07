import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class SeguimientoAccionDto {
  @ApiProperty()
  readonly accion_mejora_id: Types.ObjectId;

  @ApiProperty()
  readonly usuario_id: number;

  @ApiProperty()
  readonly usuario_rol: string;

  @ApiProperty()
  readonly descripcion_avance: string;

  @ApiProperty()
  readonly fecha_avance: Date;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
