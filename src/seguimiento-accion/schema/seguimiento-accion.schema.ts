import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AccionMejora } from '../../accion-mejora/schema/accion-mejora.schema';

@Schema({ collection: 'seguimiento_accion' })
export class SeguimientoAccion extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: AccionMejora.name })
  accion_mejora_id: Types.ObjectId;

  @Prop({ required: false })
  usuario_id: number;

  @Prop({ required: false })
  usuario_rol: string;

  @Prop({ required: false })
  descripcion_avance: string;

  @Prop({ required: false })
  fecha_avance: Date;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const SeguimientoAccionSchema =
  SchemaFactory.createForClass(SeguimientoAccion);

SeguimientoAccionSchema.set('versionKey', false);
