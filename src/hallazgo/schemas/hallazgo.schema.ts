import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ collection: 'hallazgo', versionKey: false, timestamps: true })
export class Hallazgo extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  auditoria_id: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  informe_id: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  subtema_id: Types.ObjectId;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  criterio: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: false })
  rechazado: boolean;

  @Prop({ default: true })
  activo: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const HallazgoSchema = SchemaFactory.createForClass(Hallazgo);
