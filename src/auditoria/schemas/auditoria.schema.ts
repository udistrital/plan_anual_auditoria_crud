import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {PlanAuditoria} from '../../plan-auditoria/schemas/plan-auditoria.schema'

@Schema({ collection: 'auditoria' })
export class Auditoria extends Document {
   @Prop({ required: true , type: Types.ObjectId, ref: PlanAuditoria.name })
     plan_uditoria_id: PlanAuditoria  | Types.ObjectId;

   @Prop({ required: true })
     titulo: string;

   @Prop({ required: true })
     tipo_evaluacion_id: number;

   @Prop({ required: true })
     cronograma_actividad: string[] = [];;

   @Prop({ required: true })
     estado_id: number;

   @Prop({ required: true })
     no_auditoria: number;

   @Prop({ required: true })
     consecutivo_OCI: string;

   @Prop({ required: true })
     consecutivo_IE: string;

   @Prop({ required: true })
     tipo_id: number;

   @Prop({ required: true })
     macroproceso: number;

   @Prop({ required: true })
     lider: number;

   @Prop({ required: true })
    responsable: number;

    @Prop({ required: true })
    fechaInicio:Date;

    @Prop({ required: true })
    fechaFin:Date;

    @Prop({ required: true })
    objetivo:string;

    @Prop({ required: true })
    alcance:string;

    @Prop({ required: true })
    criterio:string;

    @Prop({ required: true })
    rec_tecnologico:string;

    @Prop({ required: true })
    rec_humano:string;

    @Prop({ required: true })
    rec_fisico:string;
    
    @Prop({ required: true })
    activo: boolean;

    @Prop({ required: true })
    fecha_creacion: Date;

    @Prop({ required: true })
    fecha_modificacion: Date;
   
}
export const AuditoriaSchema = SchemaFactory.createForClass(Auditoria);