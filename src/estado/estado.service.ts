import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { PlanEstado } from './schema/estado.schema';
import { PlanEstadoDto } from './dto/estado.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
@Injectable()
export class EstadoService {
  constructor(
    @InjectModel(PlanEstado.name)
    private readonly PlanEstadoModel: Model<PlanEstado>,
    @InjectModel(PlanAuditoria.name)
    private readonly PlanAuditoriaModel: Model<PlanAuditoria>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'plan_auditoria_id' }];
  }

  private async checkRelated(PlanEstadoDto: PlanEstadoDto) {
    if (PlanEstadoDto.plan_auditoria_id) {
      const actividad = await this.PlanAuditoriaModel.findById(
        PlanEstadoDto.plan_auditoria_id,
      ).exec();
      if (!actividad) {
        throw new Error(
          `Plan auditoria relacionada con id ${PlanEstadoDto.plan_auditoria_id} no existe`,
        );
      }
    }
  }

  async post(PlanEstadoDto: PlanEstadoDto): Promise<PlanEstado> {
    const fecha = new Date();
    const planEstadoData = {
      ...PlanEstadoDto,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };
  
    const estadosRelacionados = await this.PlanEstadoModel.find({
      plan_auditoria_id: PlanEstadoDto.plan_auditoria_id,
      actual: true,
    });

    if (estadosRelacionados.length > 0) {
      await this.PlanEstadoModel.updateMany(
        { plan_auditoria_id: PlanEstadoDto.plan_auditoria_id, actual: true },
        { $set: { actual: false } }
      );
    }
  
    return await this.PlanEstadoModel.create(planEstadoData);
  }

  async getAll(filterDto: FilterDto): Promise<PlanEstado[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return await this.PlanEstadoModel.find(
      filtersService.getQuery(),
      filtersService.getFields(),
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .exec();
  }

  async getById(id: string): Promise<PlanEstado> {
    const planAuditoria = await this.PlanEstadoModel.findById(id).exec();
    if (!planAuditoria) {
      throw new Error(`${id} no existe`);
    }
    return planAuditoria;
  }

  async put(id: string, PlanEstadoDto: PlanEstadoDto): Promise<PlanEstado> {
    await this.checkRelated(PlanEstadoDto);
    const update = await this.PlanEstadoModel.findByIdAndUpdate(
      id,
      PlanEstadoDto,
      { new: true },
    ).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<PlanEstado> {
    const deleted = await this.PlanEstadoModel.findByIdAndUpdate(
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

    return await this.PlanEstadoModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }
}
