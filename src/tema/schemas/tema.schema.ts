import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export interface IHallazgo {
  _id?: Types.ObjectId;
  titulo: string;
  criterio: string;
  descripcion: string;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubtema {
  _id?: Types.ObjectId;
  titulo: string;
  activo: boolean;
  hallazgo: Types.DocumentArray<IHallazgo>;
  createdAt?: Date;
  updatedAt?: Date;
}

const HallazgoSchema = new mongoose.Schema<IHallazgo>(
  {
    titulo: { type: String, required: true },
    criterio: { type: String, required: true },
    descripcion: { type: String, required: true },
    activo: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true },
);

const SubtemaSchema = new mongoose.Schema<ISubtema>(
  {
    titulo: { type: String, required: true },
    activo: { type: Boolean, default: true },
    hallazgo: { type: [HallazgoSchema], default: [] },
  },
  { _id: true, timestamps: true },
);

@Schema({ collection: 'tema', versionKey: false, timestamps: true })
export class Tema extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  informe_id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  titulo: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: [SubtemaSchema], default: [] })
  subtema: Types.DocumentArray<ISubtema>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TemaSchema = SchemaFactory.createForClass(Tema);
