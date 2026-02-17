import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'notificacion_registro' })
export class NotificacionRegistro extends Document {
  @Prop({ required: false })
  destinatario: string;

  @Prop({ required: false })
  fecha_envio: Date;

  @Prop({ required: false, type: Object })
  metadatos: object;

  @Prop({ required: false, type: Types.ObjectId })
  referencia_id: Types.ObjectId;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const NotificacionRegistroSchema = SchemaFactory.createForClass(
  NotificacionRegistro,
);

NotificacionRegistroSchema.set('versionKey', false);