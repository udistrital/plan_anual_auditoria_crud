import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class InformeDTO {
  @ApiProperty()
  readonly auditoria_id: Types.ObjectId;

  @ApiProperty()
  readonly fecha_emision?: Date;

  @ApiProperty()
  readonly muestra?: string;

  @ApiProperty()
  readonly aspecto_general?: string;

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
  readonly dias_revision?: number;

  @ApiProperty()
  readonly fecha_fin_revision?: Date;

  @ApiProperty()
  readonly fecha_aprobacion_informe?: Date;

  @ApiProperty()
  readonly ampliacion_revision_auditor_id?: number;

  @ApiProperty({ type: [Number] })
  readonly dependencias_decididas?: number[];

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;
}
