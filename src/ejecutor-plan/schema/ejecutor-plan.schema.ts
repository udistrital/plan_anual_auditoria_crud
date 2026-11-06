import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'ejecutor_plan' })
export class EjecutorPlan extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'EjecutorDependencia' })
  ejecutor_dependencia_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'PlanMejoramiento' })
  plan_mejoramiento_id: Types.ObjectId;

  @Prop({ required: false })
  asignado_por_id: number;

  @Prop({ required: false })
  actual: boolean;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_asignacion: Date;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const EjecutorPlanSchema = SchemaFactory.createForClass(EjecutorPlan);

EjecutorPlanSchema.set('versionKey', false);
