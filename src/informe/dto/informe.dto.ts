import { ApiProperty } from '@nestjs/swagger';

export class InformeDTO {
  @ApiProperty()
  readonly auditoria_id: string;

  @ApiProperty()
  readonly fecha_emision: Date;

  @ApiProperty()
  readonly muestra?: string;

  @ApiProperty()
  readonly aspectos_generales?: string;

  @ApiProperty()
  readonly respuesta_preliminar?: string;

  @ApiProperty()
  readonly informe_final?: string;

  @ApiProperty()
  readonly observaciones_conclusiones?: string;

  @ApiProperty()
  readonly notas?: string;

  @ApiProperty()
  readonly estado_id?: number;

  @ApiProperty()
  readonly preliminar_auditor_id?: number;

  @ApiProperty()
  readonly final_auditor_id?: number;

  @ApiProperty()
  readonly preliminar_auditado_id?: number;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;
}
