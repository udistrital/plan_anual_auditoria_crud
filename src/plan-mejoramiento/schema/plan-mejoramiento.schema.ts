import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'plan_mejoramiento' })
export class PlanMejoramiento extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: 'Auditoria' })
  auditoria_id: Types.ObjectId;

  /**
   * Auditoría externa de origen (#953). Presente solo en planes de auditorías externas,
   * que no tienen `auditoria_id`; su presencia marca el origen externo.
   */
  @Prop({ required: false, type: Types.ObjectId, ref: 'AuditoriaExterna' })
  auditoria_externa_id?: Types.ObjectId;

  @Prop({ required: false })
  vigencia_id: number;

  @Prop({ required: false })
  tipo_evaluacion_id: number;

  @Prop({ required: false })
  fecha_apertura: Date;

  @Prop({ required: false })
  fecha_limite: Date;

  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  fuente: number;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const PlanMejoramientoSchema =
  SchemaFactory.createForClass(PlanMejoramiento);

PlanMejoramientoSchema.set('versionKey', false);
// Plan de una auditoría externa (consulta desde Fase 4 y desde el registro de la externa)
PlanMejoramientoSchema.index({ auditoria_externa_id: 1 }, { sparse: true });
