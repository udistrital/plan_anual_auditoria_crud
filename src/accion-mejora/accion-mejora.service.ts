import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { AccionMejora } from './schema/accion-mejora.schema';
import { AccionMejoraDto } from './dto/accion-mejora.dto';
import { PlanMejoramiento } from '../plan-mejoramiento/schema/plan-mejoramiento.schema';
import { Hallazgo } from '../hallazgo/schemas/hallazgo.schema';

@Injectable()
export class AccionMejoraService {
  constructor(
    @InjectModel(AccionMejora.name)
    private readonly accionMejoraModel: Model<AccionMejora>,
    @InjectModel(PlanMejoramiento.name)
    private readonly planMejoramientoModel: Model<PlanMejoramiento>,
    @InjectModel(Hallazgo.name)
    private readonly hallazgoModel: Model<Hallazgo>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'plan_mejoramiento_id' }, { path: 'hallazgo_id' }];
  }

  private async checkRelated(dto: AccionMejoraDto) {
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
    if (dto.hallazgo_id) {
      const hallazgo = await this.hallazgoModel
        .findById(dto.hallazgo_id)
        .exec();
      if (!hallazgo) {
        throw new Error(
          `Hallazgo relacionado con id ${dto.hallazgo_id} no existe`,
        );
      }
    }
  }

  async post(dto: AccionMejoraDto): Promise<AccionMejora> {
    const fecha = new Date();
    const data: AccionMejoraDto = {
      ...dto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    await this.checkRelated(dto);
    return await this.accionMejoraModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<AccionMejora[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.accionMejoraModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as AccionMejora[];
  }

  async getById(id: string): Promise<AccionMejora> {
    const accion = await this.accionMejoraModel.findById(id).exec();
    if (!accion) {
      throw new Error(`${id} no existe`);
    }
    return accion;
  }

  async put(id: string, dto: AccionMejoraDto): Promise<AccionMejora> {
    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    await this.checkRelated(dto);
    const update = await this.accionMejoraModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<AccionMejora> {
    const deleted = await this.accionMejoraModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.accionMejoraModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
