import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'plan_mejoramiento' })
export class PlanMejoramiento extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: 'Auditoria' })
  auditoria_id: Types.ObjectId;

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
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const PlanMejoramientoSchema =
  SchemaFactory.createForClass(PlanMejoramiento);

PlanMejoramientoSchema.set('versionKey', false);
