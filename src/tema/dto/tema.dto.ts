import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class TemaDTO {
  @ApiProperty({ description: 'ID del informe padre' })
  readonly informe_id: Types.ObjectId;

  @ApiProperty({ description: 'Título del tema' })
  readonly titulo: string;

  @ApiProperty({ required: false, description: 'Descripción del título' })
  descripcion_titulo?: string;

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
