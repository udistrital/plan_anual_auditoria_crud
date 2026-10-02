import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'documento' })
export class Documento extends Document {
  @Prop({ required: true })
  referencia_id: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['Auditoria', 'Plan Auditoria', 'Plan Mejoramiento', 'Accion Mejora'],
  })
  referencia_tipo: string;

  @Prop({ required: true })
  nuxeo_id: number;

  @Prop({ required: true })
  nuxeo_enlace: string;

  @Prop({ required: true })
  tipo_id: number;

  @Prop({ required: false, type: Object, default: {} })
  metadatos?: Record<string, any>;

  @Prop({ required: true })
  activo: boolean;

  @Prop({ required: true })
  fecha_creacion: Date;
}

export const DocumentoSchema = SchemaFactory.createForClass(Documento);

DocumentoSchema.set('versionKey', false);
