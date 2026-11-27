import { ApiProperty } from '@nestjs/swagger';

export class EjecutorDependenciaDto {
  @ApiProperty({ description: 'ID externo de la dependencia (TERCEROS)' })
  readonly dependencia_id: number;

  @ApiProperty({ description: 'ID externo del usuario ejecutor (USUARIO_ROL)' })
  readonly usuario_id: number;

  @ApiProperty({ required: false, default: 'ejecutor' })
  usuario_rol?: string;

  @ApiProperty({
    required: false,
    description: 'Usuario que realiza la asignación',
  })
  readonly asignado_por_id?: number;

  @ApiProperty({ required: false })
  readonly vigencia_id?: number;

  @ApiProperty({ required: false, description: 'Marca la asignación vigente' })
  actual?: boolean;

  @ApiProperty({ required: false })
  activo?: boolean;

  @ApiProperty({ required: false })
  fecha_asignacion?: Date;

  @ApiProperty({
    required: false,
    description:
      'Inicio de la habilitación como ejecutor (vigencia contractual)',
  })
  fecha_inicio?: Date;

  @ApiProperty({
    required: false,
    description:
      'Fin de la habilitación como ejecutor. Al vencer, el job la desactiva.',
  })
  fecha_fin?: Date;

  @ApiProperty({ required: false })
  fecha_creacion?: Date;

  @ApiProperty({ required: false })
  fecha_modificacion?: Date;
}
