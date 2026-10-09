import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';
import {
  ConteoEstadoPlan,
  ResumenPlanMejoramiento,
} from './dto/resumen-plan-mejoramiento.dto';

/**
 * Filtros del resumen. Los opcionales se combinan para cada vista:
 * auditado → dependencia_ids; auditor → auditor_id; jefe → ninguno (toda la institución).
 */
export interface FiltrosResumenPlan {
  vigencia_id: number;
  tipo_evaluacion_id: number;
  estado_auditoria_id: number;
  /** Solo auditorías de estas dependencias. Una lista vacía no devuelve nada. */
  dependencia_ids?: number[];
  /** Solo auditorías donde la persona es auditor de la auditoría o de su plan. */
  auditor_id?: number;
}

/** Compara referencias guardadas como texto u ObjectId. */
const mismaReferencia = (campo: string, variable: string) => ({
  $eq: [{ $toString: campo }, { $toString: variable }],
});

@Injectable()
export class ResumenPlanMejoramientoService {
  constructor(
    @InjectModel(AuditoriaPadre.name)
    private readonly auditoriaPadreModel: Model<AuditoriaPadre>,
  ) {}

  /**
   * Cuenta las auditorías que están en el estado dado, agrupadas por el estado
   * de su plan de mejoramiento activo.
   */
  async getResumen(
    filtros: FiltrosResumenPlan,
  ): Promise<ResumenPlanMejoramiento> {
    if (filtros.dependencia_ids && !filtros.dependencia_ids.length) {
      return { total_auditorias: 0, por_estado: [] };
    }

    const porEstado = await this.auditoriaPadreModel
      .aggregate<ConteoEstadoPlan>(this.construirPipeline(filtros))
      .exec();

    return {
      total_auditorias: porEstado.reduce((total, e) => total + e.cantidad, 0),
      por_estado: porEstado,
    };
  }

  construirPipeline(filtros: FiltrosResumenPlan): PipelineStage[] {
    return [
      {
        $match: {
          activo: true,
          vigencia_id: filtros.vigencia_id,
          tipo_evaluacion_id: filtros.tipo_evaluacion_id,
          ...(filtros.dependencia_ids && {
            dependencia_id: { $in: filtros.dependencia_ids },
          }),
        },
      },
      {
        $lookup: {
          from: 'auditoria',
          let: { padreId: '$_id' },
          pipeline: [
            {
              $match: {
                activo: true,
                estado_id: filtros.estado_auditoria_id,
                $expr: mismaReferencia('$auditoria_padre_id', '$$padreId'),
              },
            },
            { $project: { _id: 1 } },
          ],
          as: 'auditoria',
        },
      },
      { $unwind: '$auditoria' },
      {
        $lookup: {
          from: 'plan_mejoramiento',
          let: { auditoriaId: '$auditoria._id' },
          pipeline: [
            {
              $match: {
                activo: true,
                $expr: mismaReferencia('$auditoria_id', '$$auditoriaId'),
              },
            },
            { $limit: 1 },
            { $project: { _id: 1, estado_id: 1 } },
          ],
          as: 'plan',
        },
      },
      ...(filtros.auditor_id != null
        ? this.etapasAsignacion(filtros.auditor_id)
        : []),
      {
        $group: {
          _id: { $ifNull: [{ $arrayElemAt: ['$plan.estado_id', 0] }, null] },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, estado_id: '$_id', cantidad: 1 } },
      { $sort: { estado_id: 1 } },
    ];
  }

  /**
   * Deja las auditorías donde la persona es auditor asignado de la auditoría
   * o auditor del plan (misma regla que el listado del MID).
   */
  private etapasAsignacion(auditorId: number): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'auditoria_auditor',
          let: { auditoriaId: '$auditoria._id' },
          pipeline: [
            {
              $match: {
                activo: true,
                asignado: true,
                auditor_id: auditorId,
                $expr: mismaReferencia('$auditoria_id', '$$auditoriaId'),
              },
            },
            { $limit: 1 },
            { $project: { _id: 1 } },
          ],
          as: 'asignacion_auditoria',
        },
      },
      {
        $lookup: {
          from: 'plan_mejoramiento_auditor',
          let: {
            planId: { $ifNull: [{ $arrayElemAt: ['$plan._id', 0] }, null] },
          },
          pipeline: [
            {
              $match: {
                activo: true,
                auditor_id: auditorId,
                // Sin plan no hay asignación: evita que null coincida con referencias vacías
                $expr: {
                  $and: [
                    { $ne: ['$$planId', null] },
                    mismaReferencia('$plan_mejoramiento_id', '$$planId'),
                  ],
                },
              },
            },
            { $limit: 1 },
            { $project: { _id: 1 } },
          ],
          as: 'asignacion_plan',
        },
      },
      {
        $match: {
          $or: [
            { 'asignacion_auditoria.0': { $exists: true } },
            { 'asignacion_plan.0': { $exists: true } },
          ],
        },
      },
    ];
  }
}
