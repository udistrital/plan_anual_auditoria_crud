import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Auditoria } from './schemas/auditoria.schema';
import { AuditoriaDTO } from './dto/auditoria.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
import { Auditor } from '../auditoria-auditor/schemas/auditor.schema';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';
@Injectable()
export class AuditoriaService {
  constructor(
    @InjectModel(Auditoria.name)
    private readonly AuditoriaModel: Model<Auditoria>,
    @InjectModel(PlanAuditoria.name)
    private readonly PlanAuditoriaModel: Model<PlanAuditoria>,
    @InjectModel(AuditoriaPadre.name)
    private readonly AuditoriaPadreModel: Model<AuditoriaPadre>,
    @InjectModel(Auditor.name)
    private readonly AuditorModel: Model<Auditor>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'plan_auditoria_id' }, { path: 'auditoria_padre_id' }];
  }

  private async checkRelated(AuditoriaDTO: AuditoriaDTO) {
    // TODO: eliminar la validación por `plan_auditoria_id` cuando la migración a `auditoria_padre_id` esté completa
    if (AuditoriaDTO.plan_auditoria_id) {
      const planAuditoria = await this.PlanAuditoriaModel.findById(
        AuditoriaDTO.plan_auditoria_id,
      ).exec();
      if (!planAuditoria) {
        throw new Error(
          `Plan auditoria relacionada con id ${AuditoriaDTO.plan_auditoria_id} no existe`,
        );
      }
    }
    // Validar relación con auditoria_padre si viene provista
    if ((AuditoriaDTO as any).auditoria_padre_id) {
      const padre = await this.AuditoriaPadreModel.findById(
        (AuditoriaDTO as any).auditoria_padre_id,
      ).exec();
      if (!padre) {
        throw new Error(
          `Auditoria padre relacionada con id ${(AuditoriaDTO as any).auditoria_padre_id} no existe`,
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
    return (await this.AuditoriaModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as Auditoria[];
  }

  async getById(id: string): Promise<Auditoria> {
    const Auditoria = await this.AuditoriaModel.findById(id).exec();
    if (!Auditoria) {
      throw new Error(`${id} no existe`);
    }
    return Auditoria;
  }

  async put(id: string, AuditoriaDto: AuditoriaDTO): Promise<Auditoria> {
    AuditoriaDto.fecha_modificacion = new Date();
    if (AuditoriaDto.fecha_creacion) {
      delete AuditoriaDto.fecha_creacion;
    }
    await this.checkRelated(AuditoriaDto);
    const update = await this.AuditoriaModel.findByIdAndUpdate(
      id,
      AuditoriaDto,
      { new: true },
    ).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<Auditoria> {
    const deleted = await this.AuditoriaModel.findByIdAndUpdate(
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

    return await this.AuditoriaModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }

  async getByAuditor(
    personaId: number,
    filterDto: FilterDto,
  ): Promise<Auditoria[]> {
    const auditores = await this.AuditorModel.find({
      auditor_id: personaId,
      activo: true,
    })
      .select('auditoria_id')
      .lean()
      .exec();

    if (!auditores || auditores.length === 0) {
      return [];
    }

    const auditoriaIds = auditores.map((a) => a.auditoria_id);

    const filtersService = new FiltersService(filterDto);
    const query = { ...filtersService.getQuery(), _id: { $in: auditoriaIds } };

    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }

    return (await this.AuditoriaModel.find(
      query,
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as Auditoria[];
  }

  async countByAuditor(
    personaId: number,
    filterDto: FilterDto,
  ): Promise<number> {
    const auditores = await this.AuditorModel.find({
      auditor_id: personaId,
      activo: true,
    })
      .select('auditoria_id')
      .lean()
      .exec();

    if (!auditores || auditores.length === 0) {
      return 0;
    }

    const auditoriaIds = auditores.map((a) => a.auditoria_id);

    const filtersService = new FiltersService(filterDto);
    const query = { ...filtersService.getQuery(), _id: { $in: auditoriaIds } };

    return await this.AuditoriaModel.countDocuments(query).exec();
  }
}
