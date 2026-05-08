import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Auditor } from './schemas/auditor.schema';
import { AuditorDTO } from './dto/auditor.dto';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';

@Injectable()
export class AuditorService {
  constructor(
    @InjectModel(Auditor.name)
    private readonly AuditorModel: Model<Auditor>,
    @InjectModel(Auditoria.name)
    private readonly AuditoriaModel: Model<Auditoria>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'auditoria_id' }];
  }

  private async checkRelated(AuditorDTO: AuditorDTO) {
    if (AuditorDTO.auditoria_id) {
      const auditor = await this.AuditoriaModel.findById(
        AuditorDTO.auditoria_id,
      ).exec();
      if (!auditor) {
        throw new Error(
          `Auditoria relacionada con id ${AuditorDTO.auditoria_id} no existe`,
        );
      }
    }
  }
  async post(AuditorDTO: AuditorDTO): Promise<Auditor> {
    const fecha = new Date();
    const auditorData: AuditorDTO = {
      ...AuditorDTO,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    await this.checkRelated(AuditorDTO);
    return await this.AuditorModel.create(auditorData);
  }
  async getAll(filterDto: FilterDto): Promise<Auditor[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.AuditorModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as Auditor[];
  }

  async getById(id: string): Promise<Auditor> {
    const auditor = await this.AuditorModel.findById(id).exec();
    if (!auditor) {
      throw new Error(`${id} no existe`);
    }
    return auditor;
  }

  async put(id: string, AuditorDTO: AuditorDTO): Promise<Auditor> {
    AuditorDTO.fecha_modificacion = new Date();
    if (AuditorDTO.fecha_creacion) {
      delete AuditorDTO.fecha_creacion;
    }
    await this.checkRelated(AuditorDTO);
    const update = await this.AuditorModel.findByIdAndUpdate(id, AuditorDTO, {
      new: true,
    }).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<Auditor> {
    const deleted = await this.AuditorModel.findByIdAndUpdate(
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

    return await this.AuditorModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }
}
