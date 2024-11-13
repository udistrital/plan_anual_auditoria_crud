import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auditoria } from '../../auditoria/schemas/auditoria.schema'

@Schema({ collection: 'actividad' })
export class Actividad extends Document {
    @Prop({ required: false, type: Types.ObjectId, ref: Auditoria.name })
    auditoria_id: Auditoria | Types.ObjectId;

    @Prop({ required: false })
    titulo: string;

    @Prop({ required: false })
    fecha_inicio: Date;

    @Prop({ required: false })
    fecha_fin: Date;

    @Prop({ required: false })
    referencia: string;

    @Prop({ required: false })
    descripcion: string;

    @Prop({ required: false })
    folio: number;

    @Prop({ required: false })
    medio_id: number;

    @Prop({ required: false })
    carpeta: string;

    @Prop({ required: false })
    activo: boolean;

    @Prop({ required: false })
    fecha_creacion: Date;

    @Prop({ required: false })
    fecha_modificacion: Date;

}

export const ActividadSchema = SchemaFactory.createForClass(Actividad);

ActividadSchema.set('versionKey', false);
