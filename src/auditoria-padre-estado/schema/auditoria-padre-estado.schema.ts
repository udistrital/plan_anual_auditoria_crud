import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuditoriaPadre } from '../../auditoria-padre/schemas/auditoria-padre.schema';

@Schema({ collection: 'auditoria_padre_estado' })
export class AuditoriaPadreEstado extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: AuditoriaPadre.name })
  auditoria_padre_id: AuditoriaPadre | Types.ObjectId;

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
  fase_id: string;

  @Prop({ required: false })
  fecha_ejecucion_estado: Date;

  @Prop({ required: false })
  activo: boolean;
}

export const AuditoriaPadreEstadoSchema = SchemaFactory.createForClass(AuditoriaPadreEstado);

AuditoriaPadreEstadoSchema.set('versionKey', false);
