import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { NotificacionRegistro } from './schema/notificacion-registro.schema';
import { NotificacionRegistroDTO } from './dto/notificacion-registro.dto';

@Injectable()
export class NotificacionRegistroService {
  constructor(
    @InjectModel(NotificacionRegistro.name)
    private readonly notificacionRegistroModel: Model<NotificacionRegistro>,
  ) {}

  async post(
    notificacionRegistroDTO: NotificacionRegistroDTO,
  ): Promise<NotificacionRegistro> {
    const fecha = new Date();
    const notificacionData = {
      ...notificacionRegistroDTO,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    return await this.notificacionRegistroModel.create(notificacionData);
  }

  async getAll(filterDto: FilterDto): Promise<NotificacionRegistro[]> {
    const filtersService = new FiltersService(filterDto);
    return (await this.notificacionRegistroModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .lean()
      .exec()) as unknown as NotificacionRegistro[];
  }

  async getById(id: string): Promise<NotificacionRegistro> {
    const notificacion = await this.notificacionRegistroModel
      .findById(id)
      .exec();
    if (!notificacion) {
      throw new Error(`${id} no existe`);
    }
    return notificacion;
  }

  async put(
    id: string,
    notificacionRegistroDTO: NotificacionRegistroDTO,
  ): Promise<NotificacionRegistro> {
    const updateData = {
      ...notificacionRegistroDTO,
      fecha_modificacion: new Date(),
    };
    const update = await this.notificacionRegistroModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<NotificacionRegistro> {
    const deleted = await this.notificacionRegistroModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.notificacionRegistroModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}