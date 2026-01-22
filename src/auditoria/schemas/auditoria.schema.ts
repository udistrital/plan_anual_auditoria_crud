import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanAuditoria } from '../../plan-auditoria/schemas/plan-auditoria.schema'

@Schema({ collection: 'auditoria' })
export class Auditoria extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: PlanAuditoria.name })
  plan_auditoria_id: PlanAuditoria | Types.ObjectId;

  @Prop({ required: false })
  titulo: string;

  @Prop({ required: false })
  tipo_evaluacion_id: number;

  @Prop({ required: false })
  cronograma_id: number[] = [];;

  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  no_auditoria: number;
  
  @Prop({ required: true })
  vigencia_id: number;

  @Prop({ required: false })
  consecutivo_OCI: string;

  @Prop({ required: false })
  consecutivo_IE: string;

  @Prop({ required: false })
  tipo_id: number;

  @Prop({ required: false })
  macroproceso: number;

  @Prop({ required: false })
  lider_id: number;

  @Prop({ required: false })
  responsable_id: number;

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
  temas: string;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;

}
export const AuditoriaSchema = SchemaFactory.createForClass(Auditoria);

AuditoriaSchema.set('versionKey', false);
