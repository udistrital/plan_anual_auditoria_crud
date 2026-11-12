import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { ComentarioAccion } from './schema/comentario-accion.schema';
import { ComentarioAccionDto } from './dto/comentario-accion.dto';
import { AccionMejora } from '../accion-mejora/schema/accion-mejora.schema';

@Injectable()
export class ComentarioAccionService {
  constructor(
    @InjectModel(ComentarioAccion.name)
    private readonly comentarioAccionModel: Model<ComentarioAccion>,
    @InjectModel(AccionMejora.name)
    private readonly accionMejoraModel: Model<AccionMejora>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'accion_mejora_id' }];
  }

  private async checkRelated(dto: ComentarioAccionDto) {
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

  async post(dto: ComentarioAccionDto): Promise<ComentarioAccion> {
    const fecha = new Date();
    const data: ComentarioAccionDto = {
      ...dto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    await this.checkRelated(dto);
    return await this.comentarioAccionModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<ComentarioAccion[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.comentarioAccionModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as ComentarioAccion[];
  }

  async getById(id: string): Promise<ComentarioAccion> {
    const comentario = await this.comentarioAccionModel.findById(id).exec();
    if (!comentario) {
      throw new Error(`${id} no existe`);
    }
    return comentario;
  }

  async put(id: string, dto: ComentarioAccionDto): Promise<ComentarioAccion> {
    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    await this.checkRelated(dto);
    const update = await this.comentarioAccionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<ComentarioAccion> {
    const deleted = await this.comentarioAccionModel
      .findByIdAndUpdate(
        id,
        { activo: false, fecha_modificacion: new Date() },
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
    return await this.comentarioAccionModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
