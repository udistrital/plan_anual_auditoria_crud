import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PlanMejoramiento } from '../../plan-mejoramiento/schema/plan-mejoramiento.schema';
import { Hallazgo } from '../../hallazgo/schemas/hallazgo.schema';

@Schema({ collection: 'accion_mejora' })
export class AccionMejora extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: PlanMejoramiento.name })
  plan_mejoramiento_id: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: Hallazgo.name })
  hallazgo_id: Types.ObjectId;

  @Prop({ required: false })
  no_accion: string;

  @Prop({ required: false })
  descripcion: string;

  @Prop({ required: false })
  tipo_id: number;

  @Prop({ required: false })
  nombre_indicador: string;

  @Prop({ required: false })
  formula_indicador: string;

  @Prop({ required: false })
  meta: string;

  @Prop({ required: false })
  fecha_inicio: Date;

  @Prop({ required: false })
  fecha_fin: Date;

  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  creado_por_id: number;

  @Prop({ required: false })
  creado_por_rol: string;

  @Prop({ required: false })
  modificado_por_id: number;

  @Prop({ required: false })
  modificado_por_rol: string;

  @Prop({ required: false })
  en_revision: boolean;
  
  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const AccionMejoraSchema = SchemaFactory.createForClass(AccionMejora);

AccionMejoraSchema.set('versionKey', false);
