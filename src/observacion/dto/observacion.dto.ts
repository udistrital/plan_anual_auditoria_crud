import { ApiProperty } from '@nestjs/swagger';

export class CreateObservacionDTO {
  @ApiProperty({ description: 'ID del hallazgo asociado' })
  readonly hallazgo_id: string;

  @ApiProperty({ description: 'Texto de la observación' })
  readonly observacion: string;

  @ApiProperty({
    type: [Number],
    default: [],
    description: 'Array de IDs de dependencias asociadas',
  })
  readonly dependencia_id: number[];

  @ApiProperty({ description: 'ID del usuario que crea la observación' })
  readonly usuario_id: number;

  @ApiProperty({ description: 'Rol del usuario que crea la observación' })
  readonly usuario_rol: string;

  @ApiProperty({
    required: false,
    default: true,
    description: 'Estado activo de la observación',
  })
  activo?: boolean;
}

export class UpdateObservacionDTO {
  @ApiProperty({ required: false, description: 'Texto de la observación' })
  readonly observacion?: string;

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Array de IDs de dependencias asociadas',
  })
  readonly dependencia_id?: number[];

  @ApiProperty({
    required: false,
    description: 'Estado activo de la observación',
  })
  readonly activo?: boolean;
}

export class ObservacionDTO {
  @ApiProperty()
  readonly hallazgo_id: string;

  @ApiProperty()
  readonly observacion: string;

  @ApiProperty({ type: [Number] })
  readonly dependencia_id: number[];

  @ApiProperty()
  readonly usuario_id: number;

  @ApiProperty()
  readonly usuario_rol: string;

  @ApiProperty()
  activo: boolean;
}
