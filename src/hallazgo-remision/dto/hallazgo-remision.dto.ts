import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class HallazgoRemisionDTO {
  @ApiProperty()
  readonly hallazgo_id: Types.ObjectId;

  @ApiProperty()
  readonly dependencia_origen_id: number;

  @ApiProperty()
  readonly dependencia_destino_id: number[];

  @ApiProperty()
  readonly usuario_id: number;

  @ApiProperty()
  readonly usuario_rol?: string;

  @ApiProperty()
  readonly observacion: string;

  @ApiProperty()
  readonly estado: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
