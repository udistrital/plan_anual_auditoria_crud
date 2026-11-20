import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuditoriaExterna } from '../../auditoria-externa/schema/auditoria-externa.schema';

/** Historial de estados de una auditoría externa (#953); `actual` marca el vigente. */
@Schema({ collection: 'auditoria_externa_estado' })
export class AuditoriaExternaEstado extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: AuditoriaExterna.name })
  auditoria_externa_id: AuditoriaExterna | Types.ObjectId;

  @Prop({ required: false })
  usuario_id: number;

  @Prop({ required: false })
  usuario_rol: string;

  @Prop({ required: false })
  observacion: string;

  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  actual: boolean;

  @Prop({ required: false })
  fecha_ejecucion_estado: Date;

  @Prop({ required: false })
  activo: boolean;
}

export const AuditoriaExternaEstadoSchema = SchemaFactory.createForClass(
  AuditoriaExternaEstado,
);

AuditoriaExternaEstadoSchema.set('versionKey', false);
// Estado vigente y trazabilidad de una auditoría externa
AuditoriaExternaEstadoSchema.index({ auditoria_externa_id: 1, actual: 1 });
