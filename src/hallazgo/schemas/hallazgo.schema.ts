import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ collection: 'hallazgo', versionKey: false })
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

  @Prop({ required: false, default: null })
  rechazado_por: number | null;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion?: Date;

  @Prop({ required: false })
  fecha_modificacion?: Date;
}

export const HallazgoSchema = SchemaFactory.createForClass(Hallazgo);
