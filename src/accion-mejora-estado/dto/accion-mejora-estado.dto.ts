import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class AccionMejoraEstadoDto {
  @ApiProperty()
  readonly accion_mejora_id: Types.ObjectId;

  @ApiProperty()
  readonly usuario_id: number;

  @ApiProperty()
  readonly usuario_rol: string;

  @ApiProperty()
  readonly observacion: string;

  @ApiProperty()
  actual: boolean;

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  fecha_ejecucion_estado: Date;

  @ApiProperty()
  activo: boolean;
}
