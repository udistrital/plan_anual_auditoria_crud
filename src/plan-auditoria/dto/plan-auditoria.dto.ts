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
    readonly creadoPorId: number;

    @ApiProperty()
    readonly estadoId: number;

    @ApiProperty()
    readonly vigenciaId: number;

    @ApiProperty()
    readonly aprobadoJefeDependencia: boolean;

    @ApiProperty()
    readonly jefeDependenciaId: number;

    @ApiProperty()
    readonly aprobadoSecretarioTecnico: boolean;

    @ApiProperty()
    readonly secretarioTecnicoId: number;

    @ApiProperty()
    activo: boolean;

    @ApiProperty()
    fechaCreacion: Date;

    @ApiProperty()
    fechaModificacion: Date;

}