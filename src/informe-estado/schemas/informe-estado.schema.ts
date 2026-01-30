import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Informe } from '../../informe/schemas/informe.schema';

@Schema({ collection: 'informe_estado' })
export class InformeEstado extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: Informe.name })
  informe_id: Informe | Types.ObjectId;

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

export const InformeEstadoSchema = SchemaFactory.createForClass(InformeEstado);

InformeEstadoSchema.set('versionKey', false);