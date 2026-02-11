import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { PlanAuditoria } from './schemas/plan-auditoria.schema';
import { PlanAuditoriaDTO } from './dto/plan-auditoria.dto';

@Injectable()
export class PlanAuditoriaService {
  constructor(
    @InjectModel(PlanAuditoria.name)
    private readonly planAuditoriaModel: Model<PlanAuditoria>,
  ) {}

  async post(planAuditoriaDto: PlanAuditoriaDTO): Promise<PlanAuditoria> {
    const fecha = new Date();

    const existingPlan = await this.planAuditoriaModel.findOne({
      vigencia_id: planAuditoriaDto.vigencia_id,
      activo: true,
    });
    if (existingPlan) {
      throw new Error(
        `Ya existe un plan de auditoría activo para la vigencia ${planAuditoriaDto.vigencia_id}`,
      );
    }

    const planAuditoriaData = {
      ...planAuditoriaDto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    return await this.planAuditoriaModel.create(planAuditoriaData);
  }

  async getAll(filterDto: FilterDto): Promise<PlanAuditoria[]> {
    const filtersService = new FiltersService(filterDto);
    return (await this.planAuditoriaModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .lean()
      .exec()) as unknown as PlanAuditoria[];
  }

  async getById(id: string): Promise<PlanAuditoria> {
    const planAuditoria = await this.planAuditoriaModel.findById(id).exec();
    if (!planAuditoria) {
      throw new Error(`${id} no existe`);
    }
    return planAuditoria;
  }

  async put(
    id: string,
    planAuditoriaDto: PlanAuditoriaDTO,
  ): Promise<PlanAuditoria> {
    planAuditoriaDto.fecha_modificacion = new Date();

    if (planAuditoriaDto.vigencia_id) {
      const existingPlan = await this.planAuditoriaModel.findOne({
        vigencia_id: planAuditoriaDto.vigencia_id,
        _id: { $ne: id },
        activo: true,
      });
      if (existingPlan) {
        throw new Error(
          `Ya existe un plan de auditoría activo para la vigencia ${planAuditoriaDto.vigencia_id}`,
        );
      }
    }

    if (planAuditoriaDto.fecha_creacion) {
      delete planAuditoriaDto.fecha_creacion;
    }
    const update = await this.planAuditoriaModel
      .findByIdAndUpdate(id, planAuditoriaDto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<PlanAuditoria> {
    const deleted = await this.planAuditoriaModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }
  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);

    return await this.planAuditoriaModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
