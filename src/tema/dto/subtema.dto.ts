import { ApiProperty } from '@nestjs/swagger';

// DTO para crear un nuevo subtema
export class CreateSubtemaDTO {
  @ApiProperty({ description: 'ID del tema padre' })
  readonly tema_id: string;

  @ApiProperty({ description: 'Título del subtema' })
  readonly titulo: string;

  @ApiProperty({ 
    required: false, 
    default: true,
    description: 'Estado activo del subtema' 
  })
  activo?: boolean;
}

// DTO para actualizar un subtema existente
export class UpdateSubtemaDTO {
  @ApiProperty({ 
    required: false,
    description: 'Título del subtema' 
  })
  readonly titulo?: string;
}

// DTO completo para respuestas (mantener el original)
export class SubtemaDTO {
  @ApiProperty()
  readonly titulo: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty({ required: false })
  readonly hallazgo?: any[];
}