import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ collection: 'informe', versionKey: false, timestamps: true })
export class Informe extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Auditoria', required: true })
  auditoria_id: mongoose.Types.ObjectId; 

  @Prop({ required: true }) fecha_emision: Date;
  @Prop() muestra: string;
  @Prop() aspectos_generales: string;
  @Prop() respuesta_preliminar: string;
  @Prop() informe_final: string;
  @Prop() observaciones_conclusiones: string;
  @Prop() notas: string;

  @Prop() estado_id: number;
  @Prop() preliminar_auditor_id: number;
  @Prop() final_auditor_id: number;
  @Prop() preliminar_auditado_id: number;

  @Prop({ default: true }) activo: boolean;
}
export const InformeSchema = SchemaFactory.createForClass(Informe);