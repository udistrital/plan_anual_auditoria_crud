import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanMejoramiento } from '../../plan-mejoramiento/schema/plan-mejoramiento.schema';

@Schema({ collection: 'plan_mejoramiento_auditor' })
export class PlanMejoramientoAuditor extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: PlanMejoramiento.name })
  plan_mejoramiento_id: Types.ObjectId;

  @Prop({ required: false })
  auditor_id: number;

  @Prop({ required: false })
  asignado: boolean;

  @Prop({ required: false })
  asignado_por_id: number;

  @Prop({ required: false })
  auditor_lider: boolean;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const PlanMejoramientoAuditorSchema = SchemaFactory.createForClass(
  PlanMejoramientoAuditor,
);

PlanMejoramientoAuditorSchema.set('versionKey', false);
