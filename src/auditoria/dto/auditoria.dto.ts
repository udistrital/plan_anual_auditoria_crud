import { ApiProperty } from '@nestjs/swagger';

export class AuditoriaDTO {

  @ApiProperty()
  readonly plan_auditoria_id?: string;

  @ApiProperty()
  readonly auditoria_padre_id?: string;

  @ApiProperty()
  readonly cronograma_id: number[] = [];

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  readonly consecutivo_no_auditoria: number;

  @ApiProperty()
  readonly vigencia_id: number;

  @ApiProperty()
  readonly consecutivo_OCI: string;

  @ApiProperty()
  readonly consecutivo_IE: string;

  @ApiProperty()
  readonly fecha_inicio: Date;

  @ApiProperty()
  readonly fecha_fin: Date;

  @ApiProperty()
  readonly objetivo: string;

  @ApiProperty()
  readonly alcance: string;

  @ApiProperty()
  readonly criterio: string;

  @ApiProperty()
  readonly rec_tecnologico: string;

  @ApiProperty()
  readonly rec_humano: string;

  @ApiProperty()
  readonly rec_fisico: string;

  @ApiProperty()
  readonly tema: string;

  @ApiProperty()
  readonly correo_complementario: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
