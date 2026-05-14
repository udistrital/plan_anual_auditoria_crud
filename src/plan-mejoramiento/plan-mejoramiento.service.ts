import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { PlanMejoramiento } from './schema/plan-mejoramiento.schema';
import { PlanMejoramientoDto } from './dto/plan-mejoramiento.dto';

@Injectable()
export class PlanMejoramientoService {
  constructor(
    @InjectModel(PlanMejoramiento.name)
    private readonly planMejoramientoModel: Model<PlanMejoramiento>,
  ) {}

  async post(
    planMejoramientoDto: PlanMejoramientoDto,
  ): Promise<PlanMejoramiento> {
    const fecha = new Date();
    const data: PlanMejoramientoDto = {
      ...planMejoramientoDto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    return await this.planMejoramientoModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<PlanMejoramiento[]> {
    const filtersService = new FiltersService(filterDto);
    return (await this.planMejoramientoModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .lean()
      .exec()) as unknown as PlanMejoramiento[];
  }

  async getById(id: string): Promise<PlanMejoramiento> {
    const planMejoramiento =
      await this.planMejoramientoModel.findById(id).exec();
    if (!planMejoramiento) {
      throw new Error(`${id} no existe`);
    }
    return planMejoramiento;
  }

  async put(
    id: string,
    planMejoramientoDto: PlanMejoramientoDto,
  ): Promise<PlanMejoramiento> {
    planMejoramientoDto.fecha_modificacion = new Date();

    if (planMejoramientoDto.fecha_creacion) {
      delete planMejoramientoDto.fecha_creacion;
    }

    const update = await this.planMejoramientoModel
      .findByIdAndUpdate(id, planMejoramientoDto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<PlanMejoramiento> {
    const deleted = await this.planMejoramientoModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.planMejoramientoModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
