import { ApiProperty } from '@nestjs/swagger';
import { AuditoriaEstadoDto } from 'src/auditoria-estado/dto/auditoria-estado.dto';
import { AuditoriaDTO } from 'src/auditoria/dto/auditoria.dto';

export interface CreateAuditoriaGestion
  extends AuditoriaDTO,
    AuditoriaEstadoDto {}

export class CreateAuditoriaGestionDto implements CreateAuditoriaGestion {
  @ApiProperty()
  readonly plan_auditoria_id: string;

  @ApiProperty()
  readonly titulo: string;

  @ApiProperty()
  readonly tipo_evaluacion_id: number;

  @ApiProperty()
  readonly cronograma_id: number[];

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  readonly no_auditoria: number;

  @ApiProperty()
  readonly vigencia_id: number;

  @ApiProperty()
  readonly consecutivo_OCI: string;

  @ApiProperty()
  readonly consecutivo_IE: string;

  @ApiProperty()
  readonly tipo_id: number;

  @ApiProperty()
  readonly macroproceso: number;

  @ApiProperty()
  readonly lider_id: number;

  @ApiProperty()
  readonly responsable_id: number;

  @ApiProperty()
  readonly fecha_inicio: Date;

  @ApiProperty()
  readonly fecha_fin: Date;

  @ApiProperty()
  readonly objetivo: string;

  @ApiProperty()
  readonly alcance: string;

  @ApiProperty()
  readonly criterio: string;

  @ApiProperty()
  readonly rec_tecnologico: string;

  @ApiProperty()
  readonly rec_humano: string;

  @ApiProperty()
  readonly rec_fisico: string;

  @ApiProperty()
  readonly temas: string;

  @ApiProperty()
  readonly activo: boolean;

  @ApiProperty()
  readonly fecha_creacion: Date;

  @ApiProperty()
  readonly fecha_modificacion: Date;

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
  readonly fase_id: string;

  @ApiProperty()
  readonly fecha_ejecucion_estado: Date;
}
