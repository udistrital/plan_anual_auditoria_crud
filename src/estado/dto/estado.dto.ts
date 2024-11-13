import { ApiProperty } from '@nestjs/swagger';

export class PlanEstadoDto {
    @ApiProperty()
    readonly plan_auditoria_id: string;

    @ApiProperty()
    readonly usuario_id: number;

    @ApiProperty()
    readonly observacion: string;

    @ApiProperty()
    readonly estado_id: number;

    @ApiProperty()
    readonly fecha_ejecucion_estado: Date;

    @ApiProperty()
    activo: boolean;

}