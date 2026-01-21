import { ApiProperty } from '@nestjs/swagger';

export class SubtemaDTO {
    @ApiProperty()
    readonly titulo: string;

    @ApiProperty()
    activo: boolean;

    @ApiProperty()
    readonly hallazgo?: any[];
}