import { ApiProperty } from '@nestjs/swagger';

export class DeleteMasivoAuditoriaDto {
  @ApiProperty()
  readonly usuario_id: number;

  @ApiProperty()
  readonly usuario_rol: string;

  @ApiProperty({ required: false })
  readonly observacion?: string;

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty({ required: false })
  readonly fase_id?: string;
}
