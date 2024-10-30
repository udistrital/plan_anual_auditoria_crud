import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service'
import { Auditoria } from './schemas/auditoria.schema'
import { AuditoriaDTO } from './dto/auditoria.dto'
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
@Injectable()
export class AuditoriaService {
  constructor(
    @InjectModel(Auditoria.name)
    private readonly AuditoriaModel: Model<Auditoria>,
    @InjectModel(PlanAuditoria.name)
    private readonly PlanAuditoriaModel: Model<PlanAuditoria>
  ) { }

  private populateFields(): any[] {
    return [{ path: 'planAuditoriaId' }];
  }

  private async checkRelated(AuditoriaDTO: AuditoriaDTO) {
    if (AuditoriaDTO.planAuditoriaId) {
      const planAuditoria = await this.PlanAuditoriaModel
        .findById(AuditoriaDTO.planAuditoriaId)
        .exec();
      if (!planAuditoria) {
        throw new Error(
          `Plan auditoria relacionada con id ${AuditoriaDTO.planAuditoriaId} no existe`,
        );
      }
    }
  }
  async post(AuditoriaDto: AuditoriaDTO): Promise<Auditoria> {
    const fecha = new Date();
    const AuditoriaData = {
      ...AuditoriaDto,
      activo: true,
      fechaCreacion: fecha,
      fechaModificacion: fecha,
    };
    await this.checkRelated(AuditoriaDto);
    return await this.AuditoriaModel.create(AuditoriaData);
  }
  async getAll(filterDto: FilterDto): Promise<Auditoria[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return await this.AuditoriaModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields(),
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .exec();
  }

  async getById(id: string): Promise<Auditoria> {
    const Auditoria = await this.AuditoriaModel.findById(id).exec();
    if (!Auditoria) {
      throw new Error(`${id} no existe`);
    }
    return Auditoria;
  }

  async put(id: string, AuditoriaDto: AuditoriaDTO): Promise<Auditoria> {
    AuditoriaDto.fechaModificacion = new Date();
    if (AuditoriaDto.fechaCreacion) {
      delete AuditoriaDto.fechaCreacion;
    }
    await this.checkRelated(AuditoriaDto);
    const update = await this.AuditoriaModel
      .findByIdAndUpdate(id, AuditoriaDto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<Auditoria> {
    const deleted = await this.AuditoriaModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(): Promise<number> {
    return await this.AuditoriaModel.countDocuments().exec();
  }
}
