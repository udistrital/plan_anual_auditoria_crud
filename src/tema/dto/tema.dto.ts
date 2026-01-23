import { ApiProperty } from '@nestjs/swagger';

export class TemaDTO {
    @ApiProperty()
    readonly informe_id: string;

    @ApiProperty()
    readonly titulo: string;

    @ApiProperty()
    activo: boolean;

    @ApiProperty()
    readonly subtema?: any[];

    @ApiProperty()
    fecha_creacion: Date;
}