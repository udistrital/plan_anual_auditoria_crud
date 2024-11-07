import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanAuditoria } from '../../plan-auditoria/schemas/plan-auditoria.schema'
//cuantos estados pueden estar activos por plan de auditorita al tiempo?
@Schema({ collection: 'plan_estado' })
export class PlanEstado extends Document {
    @Prop({ required: false, type: Types.ObjectId, ref: PlanAuditoria.name, alias: "plan_auditoria_id"})
    planAuditoriaId: PlanAuditoria | Types.ObjectId;

    @Prop({ required: false, alias: "usuario_id" })
    usuarioId: number;

    @Prop({ required: false, alias: "observacion" })
    observacion: string;

    @Prop({ required: false, alias: "estado_id" })
    estadoId: number;

    @Prop({ required: false, alias: "fecha_ejecucion_estado" })
    fechaEjecucionEstado: Date;

    @Prop({ required: false, alias: "activo" })
    activo: boolean;

}

export const PlanEstadoSchema = SchemaFactory.createForClass(PlanEstado);

PlanEstadoSchema.set('versionKey', false);
