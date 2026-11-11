import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AccionMejora } from '../../accion-mejora/schema/accion-mejora.schema';

/**
 * Mensaje del foro de discusión de una acción de mejora (lista plana, solo agregar).
 * La obligatoriedad de los campos y la longitud del mensaje las valida el MID.
 */
@Schema({ collection: 'comentario_accion' })
export class ComentarioAccion extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: AccionMejora.name })
  accion_mejora_id: Types.ObjectId;

  @Prop({ required: false })
  mensaje: string;

  @Prop({ required: false })
  usuario_id: number;

  @Prop({ required: false })
  usuario_rol: string;

  @Prop({ required: false })
  dependencia_id: number;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const ComentarioAccionSchema =
  SchemaFactory.createForClass(ComentarioAccion);

ComentarioAccionSchema.set('versionKey', false);
// Consulta del foro: comentarios activos de una acción, del más reciente al más antiguo
ComentarioAccionSchema.index({
  accion_mejora_id: 1,
  activo: 1,
  fecha_creacion: -1,
});
