import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class InformeDTO {
  @ApiProperty()
  readonly auditoria_id: Types.ObjectId;

  @ApiProperty()
  readonly fecha_emision: Date;

  @ApiProperty()
  readonly muestra?: string;

  @ApiProperty()
  readonly aspectos_general?: string;

  @ApiProperty()
  readonly respuesta_preliminar?: string;

  @ApiProperty()
  readonly informe_final?: string;

  @ApiProperty()
  readonly observacion_conclusion?: string;

  @ApiProperty()
  readonly nota?: string;

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
