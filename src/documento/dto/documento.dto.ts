import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class DocumentoDTO {
  @ApiProperty()
  readonly referencia_id: Types.ObjectId;

  @ApiProperty()
  readonly referencia_tipo: string;

  @ApiProperty()
  readonly nuxeo_id: number;

  @ApiProperty()
  readonly nuxeo_enlace: string;

  @ApiProperty()
  readonly tipo_id: number;

  @ApiProperty({ required: false, type: Object })
  readonly metadatos?: Record<string, any>;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;
}
