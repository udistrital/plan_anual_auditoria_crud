import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ collection: 'observacion', versionKey: false })
export class Observacion extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  hallazgo_id: Types.ObjectId;

  @Prop({ required: true })
  observacion: string;

  @Prop({ type: [Number], default: [] })
  dependencia_id: number[];

  @Prop({ required: true })
  usuario_id: number;

  @Prop({ required: true })
  usuario_rol: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion?: Date;

  @Prop({ required: false })
  fecha_modificacion?: Date;
}

export const ObservacionSchema = SchemaFactory.createForClass(Observacion);
