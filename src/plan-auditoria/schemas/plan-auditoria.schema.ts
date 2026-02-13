import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'plan_auditoria' })
export class PlanAuditoria extends Document {
  @Prop({ required: false })
  objetivo: string;

  @Prop({ required: false })
  alcance: string;

  @Prop({ required: false })
  criterio: string;

  @Prop({ required: false })
  recurso: string;

  @Prop({ required: false })
  creado_por_id: number;

  @Prop({ required: true })
  vigencia_id: number;

  @Prop({ required: false })
  aprobado_jefe_dependencia: boolean;

  @Prop({ required: false })
  jefe_dependencia_id: number;

  @Prop({ required: false })
  aprobado_secretario_tecnico: boolean;

  @Prop({ required: false })
  secretario_tecnico_id: number;

  @Prop({ type: [{ type: String }], required: false })
  auditorias: string[];

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}
export const PlanAuditoriaSchema = SchemaFactory.createForClass(PlanAuditoria);

PlanAuditoriaSchema.set('versionKey', false);
