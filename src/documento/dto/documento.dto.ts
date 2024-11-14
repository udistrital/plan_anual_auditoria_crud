import { ApiProperty } from '@nestjs/swagger';

export class DocumentoDTO {
    @ApiProperty()
    readonly referencia_id: string;

    @ApiProperty()
    readonly referencia_tipo: string;

    @ApiProperty()
    readonly nuxeo_id: number;

    @ApiProperty()
    readonly tipo_id: number;

    @ApiProperty()
    activo: boolean;

    @ApiProperty()
    fecha_creacion: Date;
}