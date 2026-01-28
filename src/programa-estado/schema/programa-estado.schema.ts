import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auditoria } from '../../auditoria/schemas/auditoria.schema';


@Schema({ collection: 'programa_estado' })
export class ProgramaEstado extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: Auditoria.name })
  auditoria_id: Auditoria | Types.ObjectId;

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

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const ProgramaEstadoSchema =
  SchemaFactory.createForClass(ProgramaEstado);

ProgramaEstadoSchema.set('versionKey', false);
