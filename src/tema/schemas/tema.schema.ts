import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export interface ISubtema {
  _id?: Types.ObjectId;
  titulo: string;
  activo: boolean;
  fecha_creacion?: Date;
  fecha_modificacion?: Date;
}

const SubtemaSchema = new mongoose.Schema<ISubtema>(
  {
    titulo: { type: String, required: true },
    activo: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true },
);

@Schema({ collection: 'tema', versionKey: false, timestamps: true })
export class Tema extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  informe_id: Types.ObjectId;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: false })
  descripcion_titulo?: string;

  @Prop({ type: [SubtemaSchema], default: [] })
  subtema: Types.DocumentArray<ISubtema>;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion?: Date;

  @Prop({ required: false })
  fecha_modificacion?: Date;
}

export const TemaSchema = SchemaFactory.createForClass(Tema);
