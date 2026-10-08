import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';
import {
  ConteoEstadoPlan,
  ResumenPlanMejoramiento,
} from './dto/resumen-plan-mejoramiento.dto';

export interface FiltrosResumenPlan {
  vigencia_id: number;
  tipo_evaluacion_id: number;
  dependencia_ids: number[];
  estado_auditoria_id: number;
}

@Injectable()
export class ResumenPlanMejoramientoService {
  constructor(
    @InjectModel(AuditoriaPadre.name)
    private readonly auditoriaPadreModel: Model<AuditoriaPadre>,
  ) {}

  /**
   * Cuenta las auditorías de las dependencias indicadas que están en el estado dado,
   * agrupadas por el estado de su plan de mejoramiento activo.
   */
  async getResumen(
    filtros: FiltrosResumenPlan,
  ): Promise<ResumenPlanMejoramiento> {
    if (!filtros.dependencia_ids.length) {
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
          dependencia_id: { $in: filtros.dependencia_ids },
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
                // $toString tolera referencias guardadas como texto u ObjectId
                $expr: {
                  $eq: [
                    { $toString: '$auditoria_padre_id' },
                    { $toString: '$$padreId' },
                  ],
                },
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
                $expr: {
                  $eq: [
                    { $toString: '$auditoria_id' },
                    { $toString: '$$auditoriaId' },
                  ],
                },
              },
            },
            { $limit: 1 },
            { $project: { _id: 0, estado_id: 1 } },
          ],
          as: 'plan',
        },
      },
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
}
