import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { PlanMejoramientoAuditor } from './schema/plan-mejoramiento-auditor.schema';
import { PlanMejoramientoAuditorDto } from './dto/plan-mejoramiento-auditor.dto';
import { PlanMejoramiento } from '../plan-mejoramiento/schema/plan-mejoramiento.schema';

@Injectable()
export class PlanMejoramientoAuditorService {
  constructor(
    @InjectModel(PlanMejoramientoAuditor.name)
    private readonly planMejoramientoAuditorModel: Model<PlanMejoramientoAuditor>,
    @InjectModel(PlanMejoramiento.name)
    private readonly planMejoramientoModel: Model<PlanMejoramiento>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'plan_mejoramiento_id' }];
  }

  private async checkRelated(dto: PlanMejoramientoAuditorDto) {
    if (dto.plan_mejoramiento_id) {
      const plan = await this.planMejoramientoModel
        .findById(dto.plan_mejoramiento_id)
        .exec();
      if (!plan) {
        throw new Error(
          `Plan de mejoramiento relacionado con id ${dto.plan_mejoramiento_id} no existe`,
        );
      }
    }
  }

  async post(dto: PlanMejoramientoAuditorDto): Promise<PlanMejoramientoAuditor> {
    const fecha = new Date();
    const data: PlanMejoramientoAuditorDto = {
      ...dto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    await this.checkRelated(dto);
    return await this.planMejoramientoAuditorModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<PlanMejoramientoAuditor[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.planMejoramientoAuditorModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as PlanMejoramientoAuditor[];
  }

  async getById(id: string): Promise<PlanMejoramientoAuditor> {
    const auditor = await this.planMejoramientoAuditorModel.findById(id).exec();
    if (!auditor) {
      throw new Error(`${id} no existe`);
    }
    return auditor;
  }

  async put(
    id: string,
    dto: PlanMejoramientoAuditorDto,
  ): Promise<PlanMejoramientoAuditor> {
    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    await this.checkRelated(dto);
    const update = await this.planMejoramientoAuditorModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<PlanMejoramientoAuditor> {
    const deleted = await this.planMejoramientoAuditorModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.planMejoramientoAuditorModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
