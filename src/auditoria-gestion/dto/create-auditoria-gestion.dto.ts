import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuditoriaPadreEstadoDto } from 'src/auditoria-padre-estado/dto/auditoria-padre-estado.dto';
import { AuditoriaPadreDTO } from 'src/auditoria-padre/dto/auditoria-padre.dto';

export interface CreateAuditoriaGestion
  extends
    AuditoriaPadreDTO,
    Omit<AuditoriaPadreEstadoDto, 'auditoria_padre_id'> {}

export class CreateAuditoriaGestionDto implements CreateAuditoriaGestion {
  @ApiProperty()
  readonly plan_auditoria_id: string | Types.ObjectId;

  @ApiProperty()
  readonly titulo: string;

  @ApiProperty()
  readonly tipo_evaluacion_id: number;

  @ApiProperty()
  readonly cronograma_id: number[] = [];

  @ApiProperty()
  readonly estado_id: number;

  @ApiProperty()
  readonly vigencia_id: number;

  @ApiProperty()
  readonly macroproceso_id: number[] = [];

  @ApiProperty()
  readonly proceso_id: number[] = [];

  @ApiProperty()
  readonly dependencia_id: number[] = [];

  @ApiProperty()
  readonly auditorias: string[] = [];

  @ApiProperty()
  readonly cantidad_auditorias: number;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  fecha_creacion: Date;

  @ApiProperty()
  fecha_modificacion: Date;

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
