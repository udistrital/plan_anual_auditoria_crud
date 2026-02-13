import { ApiProperty } from '@nestjs/swagger';

export class ActividadDTO {
  @ApiProperty()
  readonly auditoria_id: string;

  @ApiProperty()
  readonly titulo: string;

  @ApiProperty()
  readonly fecha_inicio: Date;

  @ApiProperty()
  readonly fecha_fin: Date;

  @ApiProperty()
  readonly referencia: string;

  @ApiProperty()
  readonly descripcion: string;

  @ApiProperty()
  readonly observacion: string;

  @ApiProperty()
  readonly folio: number;

  @ApiProperty()
  readonly medio_id: number;

  @ApiProperty()
  readonly carpeta: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
