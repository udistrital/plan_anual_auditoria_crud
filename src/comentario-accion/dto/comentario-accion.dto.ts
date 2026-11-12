import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class ComentarioAccionDto {
  @ApiProperty({
    description: 'Acción de mejora a la que pertenece el comentario',
  })
  readonly accion_mejora_id: Types.ObjectId;

  @ApiProperty({
    description: 'Texto plano del comentario (máximo 1000 caracteres)',
  })
  readonly mensaje: string;

  @ApiProperty({ description: 'Id del tercero que escribió el comentario' })
  readonly usuario_id: number;

  @ApiProperty({
    description: 'Código del rol con que se escribió el comentario',
  })
  readonly usuario_rol: string;

  @ApiProperty({
    description:
      'Dependencia responsable que representa el autor (roles de dependencia)',
    required: false,
  })
  readonly dependencia_id?: number;

  @ApiProperty({ description: 'Indicador de registro activo' })
  activo: boolean;

  @ApiProperty({ description: 'Fecha del comentario' })
  fecha_creacion: Date;

  @ApiProperty({ description: 'Fecha de última modificación' })
  fecha_modificacion: Date;
}
