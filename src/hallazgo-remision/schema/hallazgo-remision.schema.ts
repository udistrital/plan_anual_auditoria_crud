import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Hallazgo } from '../../hallazgo/schemas/hallazgo.schema';

@Schema({ collection: 'hallazgo_remision' })
export class HallazgoRemision extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: Hallazgo.name })
  hallazgo_id: Hallazgo | Types.ObjectId;

  @Prop({ required: true })
  dependencia_origen_id: number;

  @Prop({ required: true, type: [Number] })
  dependencia_destino_id: number[];

  @Prop({ required: true })
  usuario_id: number;

  @Prop({ required: false })
  usuario_rol: string;

  @Prop({ required: true })
  observacion: string;

  @Prop({ required: true })
  estado: string;

  @Prop({ required: true })
  activo: boolean;

  @Prop({ required: true })
  fecha_creacion: Date;

  @Prop({ required: true })
  fecha_modificacion: Date;
}

export const HallazgoRemisionSchema =
  SchemaFactory.createForClass(HallazgoRemision);

HallazgoRemisionSchema.set('versionKey', false);
