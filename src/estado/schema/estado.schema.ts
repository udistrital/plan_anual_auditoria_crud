import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanAuditoria } from '../../plan-auditoria/schemas/plan-auditoria.schema'
//cuantos estados pueden estar activos por plan de auditorita al tiempo?
@Schema({ collection: 'plan-estado' })
export class PlanEstado extends Document {
    @Prop({ required: false, type: Types.ObjectId, ref: PlanAuditoria.name})
    plan_auditoria_id: PlanAuditoria | Types.ObjectId;

    @Prop({ required: false})
    usuario_id: number;

    @Prop({ required: false })
    observacion: string;

    @Prop({ required: false })
    estado_id: number;

    @Prop({ required: false })
    fecha_ejecucion_estado: Date;

    @Prop({ required: false })
    activo: boolean;

}

export const PlanEstadoSchema = SchemaFactory.createForClass(PlanEstado);

PlanEstadoSchema.set('versionKey', false);
