import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { EjecutorPlan } from './schema/ejecutor-plan.schema';
import { EjecutorPlanDto } from './dto/ejecutor-plan.dto';
import { EjecutorDependencia } from '../ejecutor-dependencia/schema/ejecutor-dependencia.schema';
import { PlanMejoramiento } from '../plan-mejoramiento/schema/plan-mejoramiento.schema';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';

@Injectable()
export class EjecutorPlanService {
  constructor(
    @InjectModel(EjecutorPlan.name)
    private readonly ejecutorPlanModel: Model<EjecutorPlan>,
    @InjectModel(EjecutorDependencia.name)
    private readonly ejecutorDependenciaModel: Model<EjecutorDependencia>,
    @InjectModel(PlanMejoramiento.name)
    private readonly planMejoramientoModel: Model<PlanMejoramiento>,
    @InjectModel(Auditoria.name)
    private readonly auditoriaModel: Model<Auditoria>,
    @InjectModel(AuditoriaPadre.name)
    private readonly auditoriaPadreModel: Model<AuditoriaPadre>,
  ) {}

  private populateFields(): any[] {
    return [
      { path: 'ejecutor_dependencia_id' },
      { path: 'plan_mejoramiento_id' },
    ];
  }

  /**
   * Devuelve las dependencias a las que pertenece un plan de mejoramiento,
   * recorriendo la cadena:
   *   plan_mejoramiento.auditoria_id -> auditoria.auditoria_padre_id ->
   *   auditoria_padre.dependencia_id[]
   */
  private async dependenciasDePlan(planId: any): Promise<number[]> {
    const plan = await this.planMejoramientoModel.findById(planId).exec();
    if (!plan) {
      throw new Error(`El plan de mejoramiento ${planId} no existe`);
    }
    if (!plan.auditoria_id) return [];

    const auditoria = await this.auditoriaModel
      .findById(plan.auditoria_id)
      .exec();
    if (!auditoria || !auditoria.auditoria_padre_id) return [];

    const padre = await this.auditoriaPadreModel
      .findById(auditoria.auditoria_padre_id)
      .exec();
    return padre?.dependencia_id ?? [];
  }

  /**
   * Valida que el ejecutor exista y esté vigente, y que el plan pertenezca a
   * la dependencia de ese ejecutor (integridad del par ejecutor-plan).
   */
  private async checkIntegridad(dto: EjecutorPlanDto): Promise<void> {
    const ejecutor = await this.ejecutorDependenciaModel
      .findById(dto.ejecutor_dependencia_id)
      .exec();
    if (!ejecutor) {
      throw new Error(
        `El ejecutor_dependencia ${dto.ejecutor_dependencia_id} no existe`,
      );
    }
    if (ejecutor.activo === false || ejecutor.actual === false) {
      throw new Error(
        `El ejecutor_dependencia ${dto.ejecutor_dependencia_id} no está vigente`,
      );
    }

    const dependencias = await this.dependenciasDePlan(
      dto.plan_mejoramiento_id,
    );
    if (!dependencias.includes(ejecutor.dependencia_id)) {
      throw new Error(
        `El plan ${dto.plan_mejoramiento_id} no pertenece a la dependencia ${ejecutor.dependencia_id} del ejecutor`,
      );
    }
  }

  async post(dto: EjecutorPlanDto): Promise<EjecutorPlan> {
    const fecha = new Date();

    await this.checkIntegridad(dto);

    // No duplicar la misma asignación vigente de plan al mismo ejecutor
    const existe = await this.ejecutorPlanModel
      .exists({
        ejecutor_dependencia_id: dto.ejecutor_dependencia_id,
        plan_mejoramiento_id: dto.plan_mejoramiento_id,
        actual: true,
        activo: true,
      })
      .exec();
    if (existe) {
      throw new Error(
        'El plan ya está asignado de forma vigente a ese ejecutor',
      );
    }

    const data: EjecutorPlanDto = {
      ...dto,
      actual: dto.actual ?? true,
      activo: true,
      fecha_asignacion: dto.fecha_asignacion ?? fecha,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    return await this.ejecutorPlanModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<EjecutorPlan[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.ejecutorPlanModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as EjecutorPlan[];
  }

  async getById(id: string): Promise<EjecutorPlan> {
    const ejecutorPlan = await this.ejecutorPlanModel.findById(id).exec();
    if (!ejecutorPlan) {
      throw new Error(`${id} no existe`);
    }
    return ejecutorPlan;
  }

  async put(id: string, dto: EjecutorPlanDto): Promise<EjecutorPlan> {
    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    const update = await this.ejecutorPlanModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<EjecutorPlan> {
    const deleted = await this.ejecutorPlanModel
      .findByIdAndUpdate(
        id,
        { activo: false, actual: false, fecha_modificacion: new Date() },
        { new: true },
      )
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.ejecutorPlanModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
