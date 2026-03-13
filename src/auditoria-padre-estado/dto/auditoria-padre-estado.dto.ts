import { ApiProperty } from '@nestjs/swagger';

export class AuditoriaPadreEstadoDto {
  @ApiProperty()
  readonly auditoria_padre_id: string;

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
  readonly fase_id: string;

  @ApiProperty()
  readonly fecha_ejecucion_estado: Date;

  @ApiProperty()
  activo: boolean;
}
