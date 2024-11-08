import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service'
import { PlanAuditoria } from './schemas/plan-auditoria.schema'
import { PlanAuditoriaDTO } from './dto/plan-auditoria.dto'

@Injectable()
export class PlanAuditoriaService {
  constructor(
    @InjectModel(PlanAuditoria.name)
    private readonly planAuditoriaModel: Model<PlanAuditoria>,
  ) { }

  async post(planAuditoriaDto: PlanAuditoriaDTO): Promise<PlanAuditoria> {
    const fecha = new Date();

    // Validar que no exista un plan con el mismo vigenciaId
    const existingPlan = await this.planAuditoriaModel.findOne({ vigenciaId: planAuditoriaDto.vigenciaId });
    if (existingPlan) {
      throw new Error(`Ya existe un plan de auditoría para la vigencia ${planAuditoriaDto.vigenciaId}`);
    }

    const planAuditoriaData = {
      ...planAuditoriaDto,
      activo: true,
      fechaCreacion: fecha,
      fechaModificacion: fecha,
    };
    return await this.planAuditoriaModel.create(planAuditoriaData);
  }
  
  async getAll(filterDto: FilterDto): Promise<PlanAuditoria[]> {
    const filtersService = new FiltersService(filterDto);
    return await this.planAuditoriaModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields(),
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .exec();
  }

  async getById(id: string): Promise<PlanAuditoria> {
    const planAuditoria = await this.planAuditoriaModel.findById(id).exec();
    if (!planAuditoria) {
      throw new Error(`${id} no existe`);
    }
    return planAuditoria;
  }

  async put(id: string, planAuditoriaDto: PlanAuditoriaDTO): Promise<PlanAuditoria> {
    planAuditoriaDto.fechaModificacion = new Date();

    if (planAuditoriaDto.vigenciaId) {
      const existingPlan = await this.planAuditoriaModel.findOne({ vigenciaId: planAuditoriaDto.vigenciaId, _id: { $ne: id } });
      if (existingPlan) {
        throw new Error(`Ya existe un plan de auditoría para la vigencia ${planAuditoriaDto.vigenciaId}`);
      }
    }

    if (planAuditoriaDto.fechaCreacion) {
      delete planAuditoriaDto.fechaCreacion;
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
