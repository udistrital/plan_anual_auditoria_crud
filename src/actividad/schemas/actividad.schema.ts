import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {Auditoria} from '../../auditoria/schemas/auditoria.schema'

@Schema({ collection: 'actividad' })
export class Actividad extends Document {
    @Prop({ required: false , type: Types.ObjectId, ref: Auditoria.name })
    auditoriaId:Auditoria  | Types.ObjectId;

    @Prop({ required: false })
    titulo:string;
    
    @Prop({ required: false })
    fechaInicio:Date;

    @Prop({ required: false })
    fechaFin:Date;

    @Prop({ required: false })
    referencia:string;

    @Prop({ required: false })
    descripcion:string;

    @Prop({ required: false })
    folio:number;

    @Prop({ required: false })
    medio_id:number;

    @Prop({ required: false })
    carpeta:string;

    @Prop({ required: false })
    activo: boolean;

   @Prop({ required: false })
    fechaCreacion: Date;

   @Prop({ required: false })
    fechaModificacion: Date;

}

export const ActividadSchema = SchemaFactory.createForClass(Actividad);

ActividadSchema.set('versionKey', false);
