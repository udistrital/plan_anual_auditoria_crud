import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ collection: 'informe', versionKey: false, timestamps: true })
export class Informe extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auditoria',
    required: true,
  })
  auditoria_id: mongoose.Types.ObjectId;

  @Prop() fecha_emision: Date;
  @Prop() muestra: string;
  @Prop() aspecto_general: string;
  @Prop() respuesta_preliminar: string;
  @Prop() informe_final: string;
  @Prop() observacion_conclusion: string;
  @Prop() nota: string;

  @Prop() preliminar_auditor_id: number;
  @Prop() final_auditor_id: number;
  @Prop() preliminar_auditado_id: number;

  @Prop({ default: 3 }) dias_revision: number;
  @Prop() fecha_fin_revision: Date;
  @Prop() ampliacion_revision_auditor_id: number;

  @Prop({ default: true }) activo: boolean;
}
export const InformeSchema = SchemaFactory.createForClass(Informe);
