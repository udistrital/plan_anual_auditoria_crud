import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanAuditoria } from '../../plan-auditoria/schemas/plan-auditoria.schema';
import { AuditoriaPadre } from '../../auditoria-padre/schemas/auditoria-padre.schema';

@Schema({ collection: 'auditoria' })
export class Auditoria extends Document {

  @Prop({ required: false, type: Types.ObjectId, ref: PlanAuditoria.name })
  plan_auditoria_id: PlanAuditoria | Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: AuditoriaPadre.name })
  auditoria_padre_id: AuditoriaPadre | Types.ObjectId;

  @Prop({ required: false })
  cronograma_id: number[] = [];

  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  consecutivo_no_auditoria: number;

  @Prop({ required: true })
  vigencia_id: number;

  @Prop({ required: false })
  consecutivo_OCI: string;

  @Prop({ required: false })
  consecutivo_IE: string;

  @Prop({ required: false })
  fecha_inicio: Date;

  @Prop({ required: false })
  fecha_fin: Date;

  @Prop({ required: false })
  objetivo: string;

  @Prop({ required: false })
  alcance: string;

  @Prop({ required: false })
  criterio: string;

  @Prop({ required: false })
  rec_tecnologico: string;

  @Prop({ required: false })
  rec_humano: string;

  @Prop({ required: false })
  rec_fisico: string;

  @Prop({ required: false })
  tema: string;

  @Prop({ required: false })
  correo_complementario: string;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}
export const AuditoriaSchema = SchemaFactory.createForClass(Auditoria);

AuditoriaSchema.set('versionKey', false);
