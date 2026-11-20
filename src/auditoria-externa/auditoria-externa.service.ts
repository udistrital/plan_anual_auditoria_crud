import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { AuditoriaExterna } from './schema/auditoria-externa.schema';
import { AuditoriaExternaDto } from './dto/auditoria-externa.dto';

@Injectable()
export class AuditoriaExternaService {
  constructor(
    @InjectModel(AuditoriaExterna.name)
    private readonly auditoriaExternaModel: Model<AuditoriaExterna>,
  ) {}

  async post(dto: AuditoriaExternaDto): Promise<AuditoriaExterna> {
    const fecha = new Date();
    const data: AuditoriaExternaDto = {
      ...dto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    return await this.auditoriaExternaModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<AuditoriaExterna[]> {
    const filtersService = new FiltersService(filterDto);
    return (await this.auditoriaExternaModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .lean()
      .exec()) as unknown as AuditoriaExterna[];
  }

  async getById(id: string): Promise<AuditoriaExterna> {
    const auditoria = await this.auditoriaExternaModel.findById(id).exec();
    if (!auditoria) {
      throw new Error(`${id} no existe`);
    }
    return auditoria;
  }

  async put(id: string, dto: AuditoriaExternaDto): Promise<AuditoriaExterna> {
    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    const update = await this.auditoriaExternaModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<AuditoriaExterna> {
    const deleted = await this.auditoriaExternaModel
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
    return await this.auditoriaExternaModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
