import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'responsable_accion' })
export class ResponsableAccion extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: 'AccionMejora' })
  accion_mejora_id: Types.ObjectId;

  @Prop({ required: false })
  dependencia_id: number;

  @Prop({ required: false })
  dependencia_lider: boolean;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const ResponsableAccionSchema =
  SchemaFactory.createForClass(ResponsableAccion);
