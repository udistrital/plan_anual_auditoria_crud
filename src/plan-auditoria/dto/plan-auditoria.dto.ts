import { ApiProperty } from '@nestjs/swagger';


export class PlanAuditoriaDTO{
    @ApiProperty()
    readonly objetivo: string;

    @ApiProperty()
    readonly alcance: string;

    @ApiProperty()
    readonly criterio: string;

    @ApiProperty()
    readonly recurso: string;

    @ApiProperty()
    readonly creado_por_id: number;

    @ApiProperty()
    readonly estado_id: number;

    @ApiProperty()
    readonly vigencia_id: number;

    @ApiProperty()
    readonly aprobado_jefe_dependencia: boolean;

    @ApiProperty()
    readonly jefe_dependencia_id: number;

    @ApiProperty()
    readonly aprobado_secretario_tecnico: boolean;

    @ApiProperty()
    readonly secretario_tecnico_id: number;

    @ApiProperty()
    activo: boolean;

    @ApiProperty()
    fecha_creacion: Date;

    @ApiProperty()
    fecha_modificacion: Date;

}