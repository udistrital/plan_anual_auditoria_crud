import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class ActividadDTO {
  @ApiProperty()
  readonly auditoria_id: Types.ObjectId;

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
  readonly medio: string;

  @ApiProperty()
  readonly carpeta: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;
}
