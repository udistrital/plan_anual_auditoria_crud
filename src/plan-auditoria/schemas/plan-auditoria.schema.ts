import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'plan-auditoria' })
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
  creadoPorId: number;

  @Prop({ required: false })
  estadoId: number;

  @Prop({ required: true, unique: true })
  vigenciaId: number;

  @Prop({ required: false })
  aprobadoJefeDependencia: boolean;

  @Prop({ required: false })
  jefeDependencia_id: number;

  @Prop({ required: false })
  aprobadoSecretario_tecnico: boolean;

  @Prop({ required: false })
  secretarioTecnico_id: number;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fechaCreacion: Date;

  @Prop({ required: false })
  fechaModificacion: Date;

}
export const PlanAuditoriaSchema = SchemaFactory.createForClass(PlanAuditoria);

PlanAuditoriaSchema.set('versionKey', false);
