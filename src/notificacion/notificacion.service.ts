import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Notificacion } from './schema/notificacion.schema';
import { NotificacionDTO } from './dto/notificacion.dto';

@Injectable()
export class NotificacionService {
  constructor(
    @InjectModel(Notificacion.name)
    private readonly notificacionModel: Model<Notificacion>,
  ) {}

  async post(notificacionDTO: NotificacionDTO): Promise<Notificacion> {
    const fecha = new Date();
    const notificacionData: NotificacionDTO = {
      ...notificacionDTO,
      referencia_id: new Types.ObjectId(notificacionDTO.referencia_id),
      activo: true,
      fecha_envio: fecha,
    };
    return await this.notificacionModel.create(notificacionData);
  }

  async getAll(filterDto: FilterDto): Promise<Notificacion[]> {
    const filtersService = new FiltersService(filterDto);
    return (await this.notificacionModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .lean()
      .exec()) as unknown as Notificacion[];
  }

  async getById(id: string): Promise<Notificacion> {
    const notificacion = await this.notificacionModel.findById(id).exec();
    if (!notificacion) {
      throw new Error(`${id} no existe`);
    }
    return notificacion;
  }

  async put(
    id: string,
    notificacionDTO: NotificacionDTO,
  ): Promise<Notificacion> {
    const { ...updateFields } = notificacionDTO;
    const updateData: NotificacionDTO = {
      ...updateFields,
      referencia_id: new Types.ObjectId(notificacionDTO.referencia_id),
    };
    delete (updateData as any).activo;
    delete (updateData as any).fecha_creacion;

    const update = await this.notificacionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<Notificacion> {
    const deleted = await this.notificacionModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.notificacionModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
