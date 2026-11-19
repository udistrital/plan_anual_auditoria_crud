import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

/** Datos propios del hallazgo (sin la auditoría ni la trazabilidad). */
export class AuditoriaExternaHallazgoDatosDto {
  @ApiProperty({ description: 'Id de la vigencia (Parámetros, tipo 121)' })
  readonly vigencia_id: number;

  @ApiProperty({ description: 'Código de auditoría del ente de control' })
  readonly codigo_auditoria: string;

  @ApiProperty({ description: 'Número de hallazgo en el informe' })
  readonly numeral: string;

  @ApiProperty({ description: 'Descripción del hallazgo' })
  readonly descripcion: string;

  @ApiProperty({
    description: 'Ids de las dependencias (Oikos) responsables',
    type: [Number],
  })
  readonly dependencia_id: number[];
}

export class AuditoriaExternaHallazgoDto extends AuditoriaExternaHallazgoDatosDto {
  @ApiProperty({ description: 'Id de la auditoría externa' })
  readonly auditoria_externa_id: Types.ObjectId;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}

export class AuditoriaExternaHallazgoLoteDto {
  @ApiProperty({ description: 'Id de la auditoría externa de los hallazgos' })
  readonly auditoria_externa_id: Types.ObjectId;

  @ApiProperty({
    description: 'Hallazgos a crear (máximo 500)',
    type: [AuditoriaExternaHallazgoDatosDto],
  })
  readonly hallazgos: AuditoriaExternaHallazgoDatosDto[];
}
