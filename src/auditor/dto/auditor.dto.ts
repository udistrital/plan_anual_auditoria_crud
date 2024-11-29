import { ApiProperty } from '@nestjs/swagger';

export class AuditorDTO {
    @ApiProperty()
    readonly auditoria_id: string;

    @ApiProperty()
    readonly documento_id: number;

    @ApiProperty()
    readonly asignado: boolean;

    @ApiProperty()
    activo: boolean;

    @ApiProperty()
    fecha_creacion: Date;

    @ApiProperty()
    fecha_modificacion: Date;

}