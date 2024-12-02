import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auditoria } from '../../auditoria/schemas/auditoria.schema'

@Schema({ collection: 'auditoria-auditor' })
export class Auditor extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: Auditoria.name })
    auditoria_id: Auditoria | Types.ObjectId;

    @Prop({ required: true })
    auditor_id : number;

    @Prop({ required: true, default: true })
    asignado: boolean;

    @Prop({ required: true })
    asignado_por_id: number;

    @Prop({ required: true })
    auditor_lider: boolean;

    @Prop({ required: false })
    activo: boolean;

    @Prop({ required: false })
    fecha_creacion: Date;

    @Prop({ required: false })
    fecha_modificacion: Date;

}

export const AuditorSchema = SchemaFactory.createForClass(Auditor);

AuditorSchema.set('versionKey', false);
