import { ApiProperty } from '@nestjs/swagger';

export class AuditoriaExternaDto {
  @ApiProperty({ description: 'Id de la vigencia (Parámetros, tipo 121)' })
  readonly vigencia_id: number;

  @ApiProperty({ description: 'Código del ente de control' })
  readonly codigo_entidad: string;

  @ApiProperty({ description: 'Nombre del ente de control' })
  readonly nombre_entidad: string;

  @ApiProperty({ description: 'Nombre de la auditoría' })
  readonly nombre_auditoria: string;

  @ApiProperty({ description: 'Fecha de emisión del informe final' })
  readonly fecha_informe_final: Date;

  @ApiProperty({
    description: 'Ids de las dependencias (Oikos) de los hallazgos',
    type: [Number],
  })
  readonly dependencia_id: number[];

  @ApiProperty({ description: 'Estado vigente (Parámetros)' })
  readonly estado_id: number;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
