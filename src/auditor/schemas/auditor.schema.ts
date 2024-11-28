import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auditoria } from '../../auditoria/schemas/auditoria.schema'

@Schema({ collection: 'auditor' })
export class Auditor extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: Auditoria.name })
    auditoria_id: Auditoria | Types.ObjectId;

    @Prop({ required: true })
    documento_id: string;

    @Prop({ required: true })
    asignado: boolean;

    @Prop({ required: false })
    activo: boolean;

    @Prop({ required: false })
    fecha_creacion: Date;

    @Prop({ required: false })
    fecha_modificacion: Date;

}

export const AuditorSchema = SchemaFactory.createForClass(Auditor);

AuditorSchema.set('versionKey', false);
