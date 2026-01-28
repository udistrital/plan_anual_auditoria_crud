import { ApiProperty } from '@nestjs/swagger';


export class ProgramaEstadoDto {
  @ApiProperty()
  readonly auditoria_id: string;

  @ApiProperty()
  readonly usuario_id: number;

  @ApiProperty()
  readonly usuario_rol: string;

  @ApiProperty()
  readonly observacion: string;

  @ApiProperty()
  readonly actual: boolean;

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  readonly fecha_ejecucion_estado: Date;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;
  
  @ApiProperty()
  fecha_modificacion: Date;
}
