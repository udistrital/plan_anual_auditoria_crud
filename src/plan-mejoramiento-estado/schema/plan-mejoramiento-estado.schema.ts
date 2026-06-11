import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanMejoramiento } from '../../plan-mejoramiento/schema/plan-mejoramiento.schema';

@Schema({ collection: 'plan_mejoramiento_estado' })
export class PlanMejoramientoEstado extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: PlanMejoramiento.name })
  plan_mejoramiento_id: Types.ObjectId;

  @Prop({ required: false })
  usuario_id: number;

  @Prop({ required: false })
  usuario_rol: string;

  @Prop({ required: false })
  observacion: string;

  @Prop({ required: false })
  actual: boolean;

  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  fecha_ejecucion_estado: Date;

  @Prop({ required: false })
  activo: boolean;
}

export const PlanMejoramientoEstadoSchema = SchemaFactory.createForClass(PlanMejoramientoEstado);

PlanMejoramientoEstadoSchema.set('versionKey', false);
