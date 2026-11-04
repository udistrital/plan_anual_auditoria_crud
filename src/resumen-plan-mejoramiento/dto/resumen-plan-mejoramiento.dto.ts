import { ApiProperty } from '@nestjs/swagger';

export class ResumenPlanMejoramientoQueryDto {
  @ApiProperty({
    required: true,
    description: 'Vigencia de la auditoría padre.',
  })
  readonly vigencia_id: string;

  @ApiProperty({
    required: true,
    description: 'Tipo de evaluación de la auditoría padre.',
  })
  readonly tipo_evaluacion_id: string;

  @ApiProperty({
    required: false,
    description:
      'Solo auditorías de estas dependencias, separadas por |. e.g. 32|45. Vacío no devuelve nada.',
  })
  readonly dependencia_ids?: string;

  @ApiProperty({
    required: false,
    description:
      'Solo auditorías donde la persona es auditor de la auditoría o de su plan.',
  })
  readonly auditor_id?: string;

  @ApiProperty({
    required: true,
    description:
      'Estado que debe tener la auditoría (p. ej. informe final aprobado).',
  })
  readonly estado_auditoria_id: string;
}

export interface ConteoEstadoPlan {
  /** Estado del plan; null cuando la auditoría no tiene plan activo. */
  estado_id: number | null;
  cantidad: number;
}

export interface ResumenPlanMejoramiento {
  total_auditorias: number;
  por_estado: ConteoEstadoPlan[];
}
