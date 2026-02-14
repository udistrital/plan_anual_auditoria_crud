import { ApiProperty } from '@nestjs/swagger';

// DTO para crear un nuevo hallazgo
export class CreateHallazgoDTO {
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
    default: true,
    description: 'Estado activo del hallazgo' 
  })
  activo?: boolean;
}

// DTO para actualizar un hallazgo existente
export class UpdateHallazgoDTO {
  @ApiProperty({ 
    required: false,
    description: 'Título del hallazgo' 
  })
  readonly titulo?: string;

  @ApiProperty({ 
    required: false,
    description: 'Criterio del hallazgo' 
  })
  readonly criterio?: string;

  @ApiProperty({ 
    required: false,
    description: 'Descripción del hallazgo' 
  })
  readonly descripcion?: string;
}

// DTO completo para respuestas (mantener el original)
export class HallazgoDTO {
  @ApiProperty()
  readonly titulo: string;

  @ApiProperty()
  readonly criterio: string;

  @ApiProperty()
  readonly descripcion: string;

  @ApiProperty()
  activo: boolean;
}