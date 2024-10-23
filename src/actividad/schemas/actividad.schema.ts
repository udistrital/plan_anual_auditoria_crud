import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {Auditoria} from '../../auditoria/schemas/auditoria.schema'

@Schema({ collection: 'actividad' })
export class Actividad extends Document {
    @Prop({ required: true , type: Types.ObjectId, ref: Auditoria.name })
    auditoria_id:Auditoria  | Types.ObjectId;

    @Prop({ required: true })
    titulo:string;
    
    @Prop({ required: true })
    fechaInicio:Date;

    @Prop({ required: true })
    fechaFin:Date;

    @Prop({ required: true })
    referencia:string;

    @Prop({ required: true })
    descripcion:string;

    @Prop({ required: true })
    folio:number;

    @Prop({ required: true })
    medio_id:number;

    @Prop({ required: true })
    carpeta:string;

    @Prop({ required: true })
    activo: boolean;

   @Prop({ required: true })
    fecha_creacion: Date;

   @Prop({ required: true })
    fecha_modificacion: Date;

}

export const ActividadSchema = SchemaFactory.createForClass(Actividad);