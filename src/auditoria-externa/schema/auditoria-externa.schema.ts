import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Auditoría de un ente de control ya terminada, registrada por el auditor (#953).
 * La obligatoriedad de los campos, los duplicados y las referencias (Parámetros, Oikos)
 * las valida el MID.
 */
@Schema({ collection: 'auditoria_externa' })
export class AuditoriaExterna extends Document {
  @Prop({ required: false })
  vigencia_id: number;

  @Prop({ required: false })
  codigo_entidad: string;

  @Prop({ required: false })
  nombre_entidad: string;

  @Prop({ required: false })
  nombre_auditoria: string;

  @Prop({ required: false })
  fecha_informe_final: Date;

  /** Unión de las dependencias (Oikos) de los hallazgos. */
  @Prop({ required: false, type: [Number] })
  dependencia_id: number[];

  /** Estado vigente (Parámetros), copia del registro actual de `auditoria_externa_estado`. */
  @Prop({ required: false })
  estado_id: number;

  @Prop({ required: false })
  activo: boolean;

  @Prop({ required: false })
  fecha_creacion: Date;

  @Prop({ required: false })
  fecha_modificacion: Date;
}

export const AuditoriaExternaSchema =
  SchemaFactory.createForClass(AuditoriaExterna);

AuditoriaExternaSchema.set('versionKey', false);
// Listado por vigencia, de la más reciente a la más antigua
AuditoriaExternaSchema.index({
  vigencia_id: 1,
  activo: 1,
  fecha_creacion: -1,
});
// Verificación de duplicados al registrar: misma entidad, nombre y fecha del informe
AuditoriaExternaSchema.index({
  codigo_entidad: 1,
  nombre_auditoria: 1,
  fecha_informe_final: 1,
});
