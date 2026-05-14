import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { SeguimientoAccion } from './schema/seguimiento-accion.schema';
import { SeguimientoAccionDto } from './dto/seguimiento-accion.dto';
import { AccionMejora } from '../accion-mejora/schema/accion-mejora.schema';

@Injectable()
export class SeguimientoAccionService {
  constructor(
    @InjectModel(SeguimientoAccion.name)
    private readonly seguimientoAccionModel: Model<SeguimientoAccion>,
    @InjectModel(AccionMejora.name)
    private readonly accionMejoraModel: Model<AccionMejora>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'accion_mejora_id' }];
  }

  private async checkRelated(dto: SeguimientoAccionDto) {
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

  async post(dto: SeguimientoAccionDto): Promise<SeguimientoAccion> {
    const fecha = new Date();
    const data: SeguimientoAccionDto = {
      ...dto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    await this.checkRelated(dto);
    return await this.seguimientoAccionModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<SeguimientoAccion[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.seguimientoAccionModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as SeguimientoAccion[];
  }

  async getById(id: string): Promise<SeguimientoAccion> {
    const seguimiento = await this.seguimientoAccionModel.findById(id).exec();
    if (!seguimiento) {
      throw new Error(`${id} no existe`);
    }
    return seguimiento;
  }

  async put(id: string, dto: SeguimientoAccionDto): Promise<SeguimientoAccion> {
    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    await this.checkRelated(dto);
    const update = await this.seguimientoAccionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<SeguimientoAccion> {
    const deleted = await this.seguimientoAccionModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.seguimientoAccionModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
