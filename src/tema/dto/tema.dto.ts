import { ApiProperty } from '@nestjs/swagger';

export class TemaDTO {
  @ApiProperty({ description: 'ID del informe padre' })
  readonly informe_id: string;

  @ApiProperty({ description: 'Título del tema' })
  readonly titulo: string;

  @ApiProperty({ required: false, default: true })
  activo?: boolean;

  @ApiProperty({ required: false })
  readonly subtema?: any[];

  @ApiProperty({ required: false })
  fecha_creacion?: Date;
}

export class UpdateTemaDTO {
  @ApiProperty({
    required: false,
    description: 'Título del tema',
  })
  readonly titulo?: string;
}
