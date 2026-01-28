import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { ProgramaEstado } from './schema/programa-estado.schema';
import { ProgramaEstadoDto } from './dto/programa-estado.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';

/**
 * Service to manage ProgramaEstado entities.
 * 
 * Provides methods to create, read, update, delete, and count ProgramaEstado records.
 */
@Injectable()
export class ProgramaEstadoService {
  constructor(
    @InjectModel(ProgramaEstado.name)
    private readonly ProgramaEstadoModel: Model<ProgramaEstado>,
    @InjectModel(Auditoria.name)
    private readonly AuditoriaModel: Model<Auditoria>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'auditoria_id' }];
  }

  private async checkRelated(programaEstadoDto: ProgramaEstadoDto) {
    if (programaEstadoDto.auditoria_id) {
      const actividad = await this.AuditoriaModel.findById(
        programaEstadoDto.auditoria_id,
      ).exec();
      if (!actividad) {
        throw new Error(
          `Plan auditoria relacionada con id ${programaEstadoDto.auditoria_id} no existe`,
        );
      }
    }
  }

  async post(programaEstadoDto: ProgramaEstadoDto): Promise<ProgramaEstado> {
    const fecha = new Date();
    const planEstadoData = {
      ...programaEstadoDto,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };

    const estadosRelacionados = await this.ProgramaEstadoModel.find({
      auditoria_id: programaEstadoDto.auditoria_id,
      actual: true,
    });

    if (estadosRelacionados.length > 0) {
      await this.ProgramaEstadoModel.updateMany(
        {
          auditoria_id: programaEstadoDto.auditoria_id,
          actual: true,
        },
        { $set: { actual: false } },
      );
    }

    return await this.ProgramaEstadoModel.create(planEstadoData);
  }

  async getAll(filterDto: FilterDto): Promise<ProgramaEstado[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return await this.ProgramaEstadoModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec() as unknown as ProgramaEstado[];
  }

  async getById(id: string): Promise<ProgramaEstado> {
    const planAuditoria = await this.ProgramaEstadoModel.findById(id).exec();
    if (!planAuditoria) {
      throw new Error(`${id} no existe`);
    }
    return planAuditoria;
  }

  async put(
    id: string,
    PlanEstadoDto: ProgramaEstadoDto,
  ): Promise<ProgramaEstado> {
    await this.checkRelated(PlanEstadoDto);
    const update = await this.ProgramaEstadoModel.findByIdAndUpdate(
      id,
      PlanEstadoDto,
      { new: true },
    ).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<ProgramaEstado> {
    const deleted = await this.ProgramaEstadoModel.findByIdAndUpdate(
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

    return await this.ProgramaEstadoModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }
}
