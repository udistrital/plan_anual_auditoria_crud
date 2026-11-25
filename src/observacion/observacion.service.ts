import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Observacion } from './schemas/observacion.schema';
import {
  CreateObservacionDTO,
  UpdateObservacionDTO,
} from './dto/observacion.dto';
import { sanitizarHtmlObservacion } from './sanitizar-html.util';

@Injectable()
export class ObservacionService {
  constructor(
    @InjectModel(Observacion.name)
    private readonly ObservacionModel: Model<Observacion>,
  ) {}

  async agregarObservacion(
    createObservacionDTO: CreateObservacionDTO,
  ): Promise<Observacion> {
    return await this.ObservacionModel.create({
      ...createObservacionDTO,
      // Texto enriquecido admitido, sin contenido ejecutable (issue #958)
      observacion: sanitizarHtmlObservacion(createObservacionDTO.observacion),
      activo: createObservacionDTO.activo ?? true,
    });
  }

  async getAllObservaciones(filterDto: FilterDto): Promise<Observacion[]> {
    const filtersService = new FiltersService(filterDto);
    return (await this.ObservacionModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .lean()
      .exec()) as unknown as Observacion[];
  }

  async countObservaciones(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.ObservacionModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }

  async getObservacionById(observacionId: string): Promise<Observacion> {
    const observacion =
      await this.ObservacionModel.findById(observacionId).exec();
    if (!observacion) {
      throw new Error(`Observacion ${observacionId} no existe`);
    }
    return observacion;
  }

  async updateObservacion(
    observacionId: string,
    updateObservacionDTO: UpdateObservacionDTO,
  ): Promise<Observacion> {
    const datos: UpdateObservacionDTO = {
      ...updateObservacionDTO,
      // Texto enriquecido admitido, sin contenido ejecutable 
      ...(updateObservacionDTO.observacion !== undefined && {
        observacion: sanitizarHtmlObservacion(updateObservacionDTO.observacion),
      }),
    };
    const updated = await this.ObservacionModel.findByIdAndUpdate(
      observacionId,
      datos,
      { new: true },
    ).exec();
    if (!updated) {
      throw new Error(`Observacion ${observacionId} no existe`);
    }
    return updated;
  }

  async deleteObservacion(observacionId: string): Promise<Observacion> {
    const deleted = await this.ObservacionModel.findByIdAndUpdate(
      observacionId,
      { activo: false },
      { new: true },
    ).exec();
    if (!deleted) {
      throw new Error(`Observacion ${observacionId} no existe`);
    }
    return deleted;
  }
}
