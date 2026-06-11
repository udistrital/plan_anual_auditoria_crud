import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AccionMejora } from '../../accion-mejora/schema/accion-mejora.schema';

@Schema({ collection: 'accion_mejora_estado' })
export class AccionMejoraEstado extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: AccionMejora.name })
  accion_mejora_id: Types.ObjectId;

  @Prop({ required: false })
  usuario_id: number;

  @Prop({ required: false })
  usuario_rol: string;

  @Prop({ required: false })
  observacion: string;

  @Prop({ required: false })
  actual: boolean;

  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  fecha_ejecucion_estado: Date;

  @Prop({ required: false })
  activo: boolean;
}

export const AccionMejoraEstadoSchema = SchemaFactory.createForClass(AccionMejoraEstado);

AccionMejoraEstadoSchema.set('versionKey', false);

// Estado vigente de una acción se resuelve por { accion_mejora_id, actual: true }
AccionMejoraEstadoSchema.index({ accion_mejora_id: 1, actual: 1 });
