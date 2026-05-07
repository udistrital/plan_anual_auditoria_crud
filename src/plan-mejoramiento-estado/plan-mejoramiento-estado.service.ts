import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { PlanMejoramientoEstado } from './schema/plan-mejoramiento-estado.schema';
import { PlanMejoramientoEstadoDto } from './dto/plan-mejoramiento-estado.dto';
import { PlanMejoramiento } from '../plan-mejoramiento/schema/plan-mejoramiento.schema';

@Injectable()
export class PlanMejoramientoEstadoService {
  constructor(
    @InjectModel(PlanMejoramientoEstado.name)
    private readonly planMejoramientoEstadoModel: Model<PlanMejoramientoEstado>,
    @InjectModel(PlanMejoramiento.name)
    private readonly planMejoramientoModel: Model<PlanMejoramiento>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'plan_mejoramiento_id' }];
  }

  private async checkRelated(dto: PlanMejoramientoEstadoDto) {
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

  async post(
    dto: PlanMejoramientoEstadoDto,
  ): Promise<PlanMejoramientoEstado> {
    const fecha = new Date();
    const data: PlanMejoramientoEstadoDto = {
      ...dto,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };

    const estadosRelacionados = await this.planMejoramientoEstadoModel.find({
      plan_mejoramiento_id: dto.plan_mejoramiento_id,
      actual: true,
    });

    if (estadosRelacionados.length > 0) {
      await this.planMejoramientoEstadoModel.updateMany(
        { plan_mejoramiento_id: dto.plan_mejoramiento_id, actual: true },
        { $set: { actual: false } },
      );
    }

    const estadoCreado =
      await this.planMejoramientoEstadoModel.create(data);

    await this.planMejoramientoModel
      .findByIdAndUpdate(
        estadoCreado.plan_mejoramiento_id,
        { estado_id: estadoCreado.estado_id },
        { new: true },
      )
      .exec();

    return estadoCreado;
  }

  async getAll(filterDto: FilterDto): Promise<PlanMejoramientoEstado[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.planMejoramientoEstadoModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as PlanMejoramientoEstado[];
  }

  async getById(id: string): Promise<PlanMejoramientoEstado> {
    const estado =
      await this.planMejoramientoEstadoModel.findById(id).exec();
    if (!estado) {
      throw new Error(`${id} no existe`);
    }
    return estado;
  }

  async put(
    id: string,
    dto: PlanMejoramientoEstadoDto,
  ): Promise<PlanMejoramientoEstado> {
    await this.checkRelated(dto);
    const update = await this.planMejoramientoEstadoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<PlanMejoramientoEstado> {
    const deleted = await this.planMejoramientoEstadoModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.planMejoramientoEstadoModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
