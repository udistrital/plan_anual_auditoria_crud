import { ApiProperty } from '@nestjs/swagger';

export class CreateHallazgoDTO {
  @ApiProperty({ description: 'ID de la auditoría' })
  readonly auditoria_id: string;

  @ApiProperty({ description: 'ID del informe' })
  readonly informe_id: string;

  @ApiProperty({ description: 'ID del subtema padre' })
  readonly subtema_id: string;

  @ApiProperty({ description: 'Título del hallazgo' })
  readonly titulo: string;

  @ApiProperty({ description: 'Criterio del hallazgo' })
  readonly criterio: string;

  @ApiProperty({ description: 'Descripción del hallazgo' })
  readonly descripcion: string;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Indica si el hallazgo fue rechazado',
  })
  rechazado?: boolean;

  @ApiProperty({
    required: false,
    default: null,
    description: 'ID del usuario que rechazó el hallazgo',
  })
  rechazado_por?: number | null;

  @ApiProperty({
    required: false,
    default: true,
    description: 'Estado activo del hallazgo',
  })
  activo?: boolean;
}

export class UpdateHallazgoDTO {
  @ApiProperty({ required: false, description: 'Título del hallazgo' })
  readonly titulo?: string;

  @ApiProperty({ required: false, description: 'Criterio del hallazgo' })
  readonly criterio?: string;

  @ApiProperty({ required: false, description: 'Descripción del hallazgo' })
  readonly descripcion?: string;

  @ApiProperty({
    required: false,
    description: 'Indica si el hallazgo fue rechazado',
  })
  readonly rechazado?: boolean;

  @ApiProperty({
    required: false,
    description: 'ID del usuario que rechazó el hallazgo',
  })
  readonly rechazado_por?: number | null;
}

export class HallazgoDTO {
  @ApiProperty()
  readonly auditoria_id: string;

  @ApiProperty()
  readonly informe_id: string;

  @ApiProperty()
  readonly subtema_id: string;

  @ApiProperty()
  readonly titulo: string;

  @ApiProperty()
  readonly criterio: string;

  @ApiProperty()
  readonly descripcion: string;

  @ApiProperty()
  readonly rechazado: boolean;

  @ApiProperty()
  readonly rechazado_por: number | null;

  @ApiProperty()
  activo: boolean;
}
