import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'ejecutor_dependencia' })
export class EjecutorDependencia extends Document {
  @Prop({ required: true })
  dependencia_id: number;

  @Prop({ required: true })
  usuario_id: number;

  @Prop({ required: false, default: 'ejecutor' })
  usuario_rol: string;

  @Prop({ required: false })
  asignado_por_id: number;

  @Prop({ required: false })
  vigencia_id: number;

  @Prop({ required: false })
  actual: boolean;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_asignacion: Date;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const EjecutorDependenciaSchema =
  SchemaFactory.createForClass(EjecutorDependencia);

EjecutorDependenciaSchema.set('versionKey', false);
