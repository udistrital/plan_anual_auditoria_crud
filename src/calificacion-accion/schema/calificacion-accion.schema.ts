import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'calificacion_accion' })
export class CalificacionAccion extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: 'AccionMejora' })
  accion_mejora_id: Types.ObjectId;

  @Prop({ required: false })
  auditor_id: number;

  @Prop({ required: false })
  calificacion: number;

  @Prop({ required: false })
  observacion: string;

  @Prop({ required: false })
  fecha_calificacion: Date;

  @Prop({ required: false })
  actual: boolean;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const CalificacionAccionSchema = SchemaFactory.createForClass(CalificacionAccion);
