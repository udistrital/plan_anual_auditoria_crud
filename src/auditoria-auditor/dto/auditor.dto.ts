import { ApiProperty } from '@nestjs/swagger';

export class AuditorDTO {
    @ApiProperty()
    readonly auditoria_id: string;

    @ApiProperty()
    readonly auditor_id: number;

    @ApiProperty()
    readonly asignado: boolean;
    
    @ApiProperty()
    readonly asignado_por_id: number;
    @ApiProperty()

    readonly auditor_lider: boolean;

    @ApiProperty()
    activo: boolean;

    @ApiProperty()
    fecha_creacion: Date;

    @ApiProperty()
    fecha_modificacion: Date;

}