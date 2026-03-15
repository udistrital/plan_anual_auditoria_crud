import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { AuditoriaEstado } from './schema/auditoria-estado.schema';
import { AuditoriaEstadoDto } from './dto/auditoria-estado.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
@Injectable()
export class EstadoAuditoriaService {
  constructor(
    @InjectModel(AuditoriaEstado.name)
    private readonly AuditoriaEstadoModel: Model<AuditoriaEstado>,
    @InjectModel(Auditoria.name)
    private readonly AuditoriaModel: Model<Auditoria>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'auditoria_id' }];
  }

  private async checkRelated(auditoriaEstadoDto: AuditoriaEstadoDto) {
    if (auditoriaEstadoDto.auditoria_id) {
      const actividad = await this.AuditoriaModel.findById(
        auditoriaEstadoDto.auditoria_id,
      ).exec();
      if (!actividad) {
        throw new Error(
          `Plan auditoria relacionada con id ${auditoriaEstadoDto.auditoria_id} no existe`,
        );
      }
    }
  }

  async post(auditoriaEstadoDto: AuditoriaEstadoDto): Promise<AuditoriaEstado> {
    const fecha = new Date();
    const planEstadoData = {
      ...auditoriaEstadoDto,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };

    const estadosRelacionados = await this.AuditoriaEstadoModel.find({
      auditoria_id: auditoriaEstadoDto.auditoria_id,
      actual: true,
    });

    if (estadosRelacionados.length > 0) {
      await this.AuditoriaEstadoModel.updateMany(
        {
          auditoria_id: auditoriaEstadoDto.auditoria_id,
          actual: true,
        },
        { $set: { actual: false } },
      );
    }

    const estadoAuditoriaCreado =
      await this.AuditoriaEstadoModel.create(planEstadoData);
    const AuditoriaDatosActualizarEstado = {
      estado_id: estadoAuditoriaCreado.estado_id,
    };
    await this.AuditoriaModel.findByIdAndUpdate(
      estadoAuditoriaCreado.auditoria_id,
      AuditoriaDatosActualizarEstado,
      { new: true },
    ).exec();
    return estadoAuditoriaCreado;
  }

  async getAll(filterDto: FilterDto): Promise<AuditoriaEstado[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.AuditoriaEstadoModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as AuditoriaEstado[];
  }

  async getById(id: string): Promise<AuditoriaEstado> {
    const planAuditoria = await this.AuditoriaEstadoModel.findById(id).exec();
    if (!planAuditoria) {
      throw new Error(`${id} no existe`);
    }
    return planAuditoria;
  }

  async put(
    id: string,
    PlanEstadoDto: AuditoriaEstadoDto,
  ): Promise<AuditoriaEstado> {
    await this.checkRelated(PlanEstadoDto);
    const update = await this.AuditoriaEstadoModel.findByIdAndUpdate(
      id,
      PlanEstadoDto,
      { new: true },
    ).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<AuditoriaEstado> {
    const deleted = await this.AuditoriaEstadoModel.findByIdAndUpdate(
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

    return await this.AuditoriaEstadoModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }
}
