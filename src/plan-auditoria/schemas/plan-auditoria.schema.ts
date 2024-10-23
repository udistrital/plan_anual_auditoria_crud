import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'plan-auditoria' })
export class PlanAuditoria extends Document {
   @Prop({ required: true })
     objetivo: string;

   @Prop({ required: true })
     alcance: string;

   @Prop({ required: true })
     criterio: string;

   @Prop({ required: true })
     recurso: string;

   @Prop({ required: true })
     creado_por_id: number;

   @Prop({ required: true })
     estado_id: number;

   @Prop({ required: true })
     vigencia_id: number;

   @Prop({ required: true })
     aprobado_jefe_dependencia: boolean;

   @Prop({ required: true })
     jefe_dependencia_id: number;

   @Prop({ required: true })
     aprobado_secretario_tecnico: boolean;

   @Prop({ required: true })
     secretario_tecnico_id: number;

   @Prop({ required: true })
    activo: boolean;

   @Prop({ required: true })
    fecha_creacion: Date;

   @Prop({ required: true })
    fecha_modificacion: Date;

}
export const PlanAuditoriaSchema = SchemaFactory.createForClass(PlanAuditoria);