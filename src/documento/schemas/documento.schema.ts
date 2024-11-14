import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auditoria } from '../../auditoria/schemas/auditoria.schema'
import { PlanAuditoria } from '../../plan-auditoria/schemas/plan-auditoria.schema'

@Schema({ collection: 'documento' })
export class Documento extends Document {
    @Prop({ required: false, type: Types.ObjectId, refPath: 'referencia_modelo' })
    referencia_id: Auditoria | PlanAuditoria | Types.ObjectId;

    @Prop({ required: false, enum: ['Auditoria', 'Plan Auditoria'] })
    referencia_tipo: string;

    @Prop({ required: false })
    nuxeo_id: number;

    @Prop({ required: false })
    tipo_id: number;

    @Prop({ required: false })
    activo: boolean;

    @Prop({ required: false })
    fecha_creacion: Date;
}

export const DocumentoSchema = SchemaFactory.createForClass(Documento);

DocumentoSchema.set('versionKey', false);
