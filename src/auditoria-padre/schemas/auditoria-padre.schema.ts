import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanAuditoria } from '../../plan-auditoria/schemas/plan-auditoria.schema';

@Schema({ collection: 'auditoria_padre' })
export class AuditoriaPadre extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: PlanAuditoria.name })
  plan_auditoria_id: PlanAuditoria | Types.ObjectId;

  @Prop({ required: false })
  titulo: string;

  @Prop({ required: false })
  tipo_evaluacion_id: number;

  @Prop({ type: [{ type: String }], required: false })
  cronograma_id: string[];

  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  vigencia_id: number;

  @Prop({ required: false })
  macroproceso_id: number;

  @Prop({ required: false })
  proceso_id: number;

  @Prop({ required: false })
  dependencia_id: number;

  @Prop({ type: [{ type: String }], required: false })
  auditorias: string[];

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const AuditoriaPadreSchema = SchemaFactory.createForClass(AuditoriaPadre);
AuditoriaPadreSchema.set('versionKey', false);
