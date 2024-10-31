import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanAuditoria } from '../../plan-auditoria/schemas/plan-auditoria.schema'

@Schema({ collection: 'auditoria' })
export class Auditoria extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: PlanAuditoria.name })
  planAuditoriaId: PlanAuditoria | Types.ObjectId;

  @Prop({ required: false })
  titulo: string;

  @Prop({ required: false })
  tipoEvaluacionId: number;

  @Prop({ required: false })
  cronogramaId: number[] = [];;

  @Prop({ required: false })
  estadoId: number;

  @Prop({ required: false })
  noAuditoria: number;

  @Prop({ required: false })
  consecutivoOCI: string;

  @Prop({ required: false })
  consecutivoIE: string;

  @Prop({ required: false })
  tipoId: number;

  @Prop({ required: false })
  macroproceso: number;

  @Prop({ required: false })
  liderId: number;

  @Prop({ required: false })
  responsableId: number;

  @Prop({ required: false })
  fechaInicio: Date;

  @Prop({ required: false })
  fechaFin: Date;

  @Prop({ required: false })
  objetivo: string;

  @Prop({ required: false })
  alcance: string;

  @Prop({ required: false })
  criterio: string;

  @Prop({ required: false })
  recTecnologico: string;

  @Prop({ required: false })
  recHumano: string;

  @Prop({ required: false })
  recFisico: string;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fechaCreacion: Date;

  @Prop({ required: false })
  fechaModificacion: Date;

}
export const AuditoriaSchema = SchemaFactory.createForClass(Auditoria);

AuditoriaSchema.set('versionKey', false);
