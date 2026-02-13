import { ApiProperty } from '@nestjs/swagger';

export class HallazgoDTO {
  @ApiProperty()
  readonly titulo: string;

  @ApiProperty()
  readonly criterio: string;

  @ApiProperty()
  readonly descripcion: string;

  @ApiProperty()
  activo: boolean;
}
