import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuditoriaExterna } from '../../auditoria-externa/schema/auditoria-externa.schema';

/**
 * Hallazgo de una auditoría externa (#953). Sin informe, subtema ni criterio: no aplican.
 * La obligatoriedad de los campos y las referencias (Parámetros, Oikos) las valida el MID.
 */
@Schema({ collection: 'auditoria_externa_hallazgo' })
export class AuditoriaExternaHallazgo extends Document {
  @Prop({ required: false, type: Types.ObjectId, ref: AuditoriaExterna.name })
  auditoria_externa_id: AuditoriaExterna | Types.ObjectId;

  @Prop({ required: false })
  vigencia_id: number;

  @Prop({ required: false })
  codigo_auditoria: string;

  /** Número de hallazgo en el informe del ente de control. */
  @Prop({ required: false })
  numeral: string;

  @Prop({ required: false })
  descripcion: string;

  /** Dependencias (Oikos) candidatas a responsables del hallazgo. */
  @Prop({ required: false, type: [Number] })
  dependencia_id: number[];

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const AuditoriaExternaHallazgoSchema = SchemaFactory.createForClass(
  AuditoriaExternaHallazgo,
);

AuditoriaExternaHallazgoSchema.set('versionKey', false);
// Hallazgos activos de una auditoría externa
AuditoriaExternaHallazgoSchema.index({ auditoria_externa_id: 1, activo: 1 });
// Un número de hallazgo no se repite dentro del mismo código de auditoría de una externa.
// Parcial sobre los activos: un hallazgo eliminado (borrado lógico) no bloquea volver a registrarlo.
AuditoriaExternaHallazgoSchema.index(
  { auditoria_externa_id: 1, codigo_auditoria: 1, numeral: 1 },
  { unique: true, partialFilterExpression: { activo: true } },
);
