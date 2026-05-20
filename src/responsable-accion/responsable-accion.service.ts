import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { ResponsableAccion } from './schema/responsable-accion.schema';
import { ResponsableAccionDto } from './dto/responsable-accion.dto';
import { AccionMejora } from '../accion-mejora/schema/accion-mejora.schema';

@Injectable()
export class ResponsableAccionService {
  constructor(
    @InjectModel(ResponsableAccion.name)
    private readonly responsableAccionModel: Model<ResponsableAccion>,
    @InjectModel(AccionMejora.name)
    private readonly accionMejoraModel: Model<AccionMejora>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'accion_mejora_id' }];
  }

  private async checkRelated(dto: ResponsableAccionDto) {
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

  async post(dto: ResponsableAccionDto): Promise<ResponsableAccion> {
    const fecha = new Date();
    const data: ResponsableAccionDto = {
      ...dto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    await this.checkRelated(dto);
    return await this.responsableAccionModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<ResponsableAccion[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.responsableAccionModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as ResponsableAccion[];
  }

  async getById(id: string): Promise<ResponsableAccion> {
    const responsable = await this.responsableAccionModel.findById(id).exec();
    if (!responsable) {
      throw new Error(`${id} no existe`);
    }
    return responsable;
  }

  async put(id: string, dto: ResponsableAccionDto): Promise<ResponsableAccion> {
    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    await this.checkRelated(dto);
    const update = await this.responsableAccionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<ResponsableAccion> {
    const deleted = await this.responsableAccionModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.responsableAccionModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
