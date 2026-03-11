import { ApiProperty } from '@nestjs/swagger';

export class AuditoriaPadreDTO {
  @ApiProperty()
  readonly plan_auditoria_id: string;

  @ApiProperty()
  readonly titulo: string;

  @ApiProperty()
  readonly tipo_evaluacion_id: number;

  @ApiProperty()
  readonly cronograma_id: number[] = [];

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  readonly vigencia_id: number;

  @ApiProperty()
  readonly macroproceso_id: number;

  @ApiProperty()
  readonly proceso_id: number;

  @ApiProperty()
  readonly dependencia_id: number;

  // TODO: ¿Se mantiene esta lista?
  @ApiProperty()
  readonly auditorias: string[] = [];

  @ApiProperty()
  readonly cantidad_auditorias: number;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
