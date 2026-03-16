import { ApiProperty } from "@nestjs/swagger";

export class GenerarAuditoriaDto {

  @ApiProperty()
  readonly auditoria_id: string;

  @ApiProperty()
  readonly usuario_id: number;

  @ApiProperty()
  readonly usuario_rol: string;

  @ApiProperty()
  readonly observacion: string;

  @ApiProperty()
  readonly estado_id_padre_actual: number;

  @ApiProperty()
  readonly estado_id_padre_nuevo: number;

  @ApiProperty()
  readonly estado_id_hija_actual: number;

  @ApiProperty()
  readonly estado_id_hija_nuevo: number;

  @ApiProperty()
  readonly fase_id: string;

  @ApiProperty()
  readonly fecha_ejecucion_estado: Date;

  @ApiProperty()
  activo: boolean;

}
