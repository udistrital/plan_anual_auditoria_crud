import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuditoriaDTO } from '../../auditoria/dto/auditoria.dto';
import { Auditoria } from '../../auditoria/schemas/auditoria.schema';
//cuantos estados pueden estar activos por plan de auditorita al tiempo?
@Schema({ collection: 'auditoria_estado' })
export class AuditoriaEstado extends Document {
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
  fase_id: string;

  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  fecha_ejecucion_estado: Date;

  @Prop({ required: false })
  activo: boolean;
}

export const AuditoriaEstadoSchema =
  SchemaFactory.createForClass(AuditoriaEstado);

AuditoriaEstadoSchema.set('versionKey', false);
