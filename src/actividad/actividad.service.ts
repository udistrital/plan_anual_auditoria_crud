import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Actividad } from './schemas/actividad.schema';
import { ActividadDTO } from './dto/actividad.dto';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
@Injectable()
export class ActividadService {
  constructor(
    @InjectModel(Actividad.name)
    private readonly ActividadModel: Model<Actividad>,
    @InjectModel(Auditoria.name)
    private readonly AuditoriaModel: Model<Auditoria>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'auditoria_id' }];
  }

  private async checkRelated(ActividadDTO: ActividadDTO) {
    if (ActividadDTO.auditoria_id) {
      const actividad = await this.AuditoriaModel.findById(
        ActividadDTO.auditoria_id,
      ).exec();
      if (!actividad) {
        throw new Error(
          `Auditoria relacionada con id ${ActividadDTO.auditoria_id} no existe`,
        );
      }
    }
  }
  async post(ActividadDTO: ActividadDTO): Promise<Actividad> {
    const fecha = new Date();
    const actividadData = {
      ...ActividadDTO,
      activo: true,
      fechaCreacion: fecha,
      fechaModificacion: fecha,
    };
    await this.checkRelated(ActividadDTO);
    return await this.ActividadModel.create(actividadData);
  }
  async getAll(filterDto: FilterDto): Promise<Actividad[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.ActividadModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as Actividad[];
  }

  async getById(id: string): Promise<Actividad> {
    const planAuditoria = await this.ActividadModel.findById(id).exec();
    if (!planAuditoria) {
      throw new Error(`${id} no existe`);
    }
    return planAuditoria;
  }

  async put(id: string, ActividadDTO: ActividadDTO): Promise<Actividad> {
    ActividadDTO.fecha_modificacion = new Date();
    if (ActividadDTO.fecha_creacion) {
      delete ActividadDTO.fecha_creacion;
    }
    await this.checkRelated(ActividadDTO);
    const update = await this.ActividadModel.findByIdAndUpdate(
      id,
      ActividadDTO,
      { new: true },
    ).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<Actividad> {
    const deleted = await this.ActividadModel.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true },
    ).exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }
  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);

    return await this.ActividadModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }
}
