import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auditoria } from '../../auditoria/schemas/auditoria.schema'
import { PlanAuditoria } from '../../plan-auditoria/schemas/plan-auditoria.schema'

@Schema({ collection: 'documento' })
export class Documento extends Document {
    @Prop({ required: true})
    referencia_id: String;

    @Prop({ required: true, enum: ['Auditoria', 'Plan Auditoria'] })
    referencia_tipo: string;

    @Prop({ required: true })
    nuxeo_id: number;

    @Prop({ required: true })
    tipo_id: number;

    @Prop({ required: true })
    activo: boolean;

    @Prop({ required: true })
    fecha_creacion: Date;
}

export const DocumentoSchema = SchemaFactory.createForClass(Documento);

DocumentoSchema.set('versionKey', false);
