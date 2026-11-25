import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class AuditoriaExternaEstadoDto {
  @ApiProperty({ description: 'Id de la auditoría externa' })
  readonly auditoria_externa_id: Types.ObjectId;

  @ApiProperty({
    description: 'Id del usuario que ejecuta el estado (Terceros)',
  })
  readonly usuario_id: number;

  @ApiProperty({ description: 'Rol del usuario que ejecuta el estado' })
  readonly usuario_rol: string;

  @ApiProperty({ description: 'Observación del cambio de estado' })
  readonly observacion: string;

  @ApiProperty({ description: 'Estado (Parámetros)' })
  readonly estado_id: number;

  @ApiProperty({ description: 'Verdadero si es el estado vigente' })
  actual: boolean;

  @ApiProperty()
  fecha_ejecucion_estado: Date;

  @ApiProperty()
  activo: boolean;
}
