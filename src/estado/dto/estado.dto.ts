import { ApiProperty } from '@nestjs/swagger';

export class PlanEstadoDto {
    @ApiProperty()
    readonly planAuditoriaId: string;

    @ApiProperty()
    readonly usuarioId: number;

    @ApiProperty()
    readonly observacion: string;

    @ApiProperty()
    readonly estadoId: number;

    @ApiProperty()
    readonly fechaEjecucionEstado: Date;

    @ApiProperty()
    activo: boolean;

}