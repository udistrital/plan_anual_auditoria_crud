import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'notificacion_registro' })
export class Notificacion extends Document {
  @Prop({ required: false })
  plantilla: string;

  @Prop({ required: false })
  fecha_envio: Date;

  @Prop({ required: false, type: Object })
  metadato: object;

  @Prop({ required: false, type: Types.ObjectId })
  referencia_id: Types.ObjectId;

  @Prop({ required: true })
  referencia_tipo: string;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const NotificacionSchema = SchemaFactory.createForClass(Notificacion);

NotificacionSchema.set('versionKey', false);
