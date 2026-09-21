import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class AccionMejoraDto {
  @ApiProperty()
  readonly plan_mejoramiento_id: Types.ObjectId;

  @ApiProperty()
  readonly hallazgo_id: Types.ObjectId;

  @ApiProperty()
  readonly no_accion: string;

  @ApiProperty()
  readonly descripcion: string;

  @ApiProperty()
  readonly tipo_id: number;

  @ApiProperty()
  readonly nombre_indicador: string;

  @ApiProperty()
  readonly formula_indicador: string;

  @ApiProperty()
  readonly meta: string;

  @ApiProperty()
  readonly fecha_inicio: Date;

  @ApiProperty()
  readonly fecha_fin: Date;

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  readonly creado_por_id: number;

  @ApiProperty()
  readonly creado_por_rol: string;

  @ApiProperty()
  readonly modificado_por_id: number;

  @ApiProperty()
  readonly modificado_por_rol: string;

  @ApiProperty()
  readonly en_revision: boolean;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
