import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { CalificacionAccion } from './schema/calificacion-accion.schema';
import { CalificacionAccionDto } from './dto/calificacion-accion.dto';
import { AccionMejora } from '../accion-mejora/schema/accion-mejora.schema';

@Injectable()
export class CalificacionAccionService {
  constructor(
    @InjectModel(CalificacionAccion.name)
    private readonly calificacionAccionModel: Model<CalificacionAccion>,
    @InjectModel(AccionMejora.name)
    private readonly accionMejoraModel: Model<AccionMejora>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'accion_mejora_id' }];
  }

  private async checkRelated(dto: CalificacionAccionDto) {
    if (dto.accion_mejora_id) {
      const accion = await this.accionMejoraModel
        .findById(dto.accion_mejora_id)
        .exec();
      if (!accion) {
        throw new Error(
          `Acción de mejora relacionada con id ${dto.accion_mejora_id} no existe`,
        );
      }
    }
  }

  async post(dto: CalificacionAccionDto): Promise<CalificacionAccion> {
    const fecha = new Date();
    const data: CalificacionAccionDto = {
      ...dto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    await this.checkRelated(dto);
    return await this.calificacionAccionModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<CalificacionAccion[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.calificacionAccionModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as CalificacionAccion[];
  }

  async getById(id: string): Promise<CalificacionAccion> {
    const calificacion = await this.calificacionAccionModel.findById(id).exec();
    if (!calificacion) {
      throw new Error(`${id} no existe`);
    }
    return calificacion;
  }

  async put(
    id: string,
    dto: CalificacionAccionDto,
  ): Promise<CalificacionAccion> {
    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    await this.checkRelated(dto);
    const update = await this.calificacionAccionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<CalificacionAccion> {
    const deleted = await this.calificacionAccionModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.calificacionAccionModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
