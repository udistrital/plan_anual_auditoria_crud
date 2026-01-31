import { ApiProperty } from '@nestjs/swagger';

export class InformeEstadoDto {
  @ApiProperty()
  readonly informe_id: string;

  @ApiProperty()
  readonly usuario_id: number;

  @ApiProperty()
  readonly usuario_rol: string;

  @ApiProperty()
  readonly observacion: string;

  @ApiProperty()
  readonly actual: boolean;

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  readonly fecha_ejecucion_estado: Date;

  @ApiProperty()
  activo: boolean;
}