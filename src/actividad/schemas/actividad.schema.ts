import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'actividad' })
export class Actividad extends Document {

}

export const ActividadSchema = SchemaFactory.createForClass(Actividad);