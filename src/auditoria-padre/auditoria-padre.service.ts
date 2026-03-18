import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { AuditoriaPadre } from './schemas/auditoria-padre.schema';
import { AuditoriaPadreDTO } from './dto/auditoria-padre.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
import { EstadoAuditoriaPadreService } from '../auditoria-padre-estado/auditoria-padre-estado.service';

@Injectable()
export class AuditoriaPadreService {
  constructor(
    @InjectModel(AuditoriaPadre.name)
    private readonly AuditoriaPadreModel: Model<AuditoriaPadre>,
    @InjectModel(PlanAuditoria.name)
    private readonly PlanAuditoriaModel: Model<PlanAuditoria>,
    private readonly estadoAuditoriaPadreService: EstadoAuditoriaPadreService,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'plan_auditoria_id' }];
  }

  private async checkRelated(auditoriaPadreDTO: AuditoriaPadreDTO) {
    if (auditoriaPadreDTO.plan_auditoria_id) {
      const planAuditoria = await this.PlanAuditoriaModel.findById(
        auditoriaPadreDTO.plan_auditoria_id,
      ).exec();
      if (!planAuditoria) {
        throw new Error(
          `Plan auditoria relacionada con id ${auditoriaPadreDTO.plan_auditoria_id} no existe`,
        );
      }
    }
  }

  async post(auditoriaPadreDTO: AuditoriaPadreDTO): Promise<AuditoriaPadre> {
    const fecha = new Date();
    const auditoriaPadreData = {
      ...auditoriaPadreDTO,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    await this.checkRelated(auditoriaPadreDTO);
    const auditoriaPadreCreada =
      await this.AuditoriaPadreModel.create(auditoriaPadreData);

    if (auditoriaPadreDTO.estado_id) {
      await this.estadoAuditoriaPadreService.post({
        auditoria_padre_id: auditoriaPadreCreada._id.toString(),
        estado_id: auditoriaPadreDTO.estado_id,
        usuario_id: null,
        usuario_rol: null,
        observacion: 'Estado inicial',
        actual: true,
        fase_id: null,
        fecha_ejecucion_estado: fecha,
        activo: true,
      });
    }

    return auditoriaPadreCreada;
  }

  async getAll(filterDto: FilterDto): Promise<AuditoriaPadre[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.AuditoriaPadreModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as AuditoriaPadre[];
  }

  async getById(id: string): Promise<AuditoriaPadre> {
    const auditoriaPadre = await this.AuditoriaPadreModel.findById(id).exec();
    if (!auditoriaPadre) {
      throw new Error(`${id} no existe`);
    }
    return auditoriaPadre;
  }

  async put(
    id: string,
    auditoriaPadreDTO: AuditoriaPadreDTO,
  ): Promise<AuditoriaPadre> {
    auditoriaPadreDTO.fecha_modificacion = new Date();
    if (auditoriaPadreDTO.fecha_creacion) {
      delete auditoriaPadreDTO.fecha_creacion;
    }
    await this.checkRelated(auditoriaPadreDTO);

    const auditoriaPadreActual =
      await this.AuditoriaPadreModel.findById(id).exec();
    if (!auditoriaPadreActual) {
      throw new Error(`${id} no existe`);
    }

    if (
      auditoriaPadreDTO.estado_id &&
      auditoriaPadreDTO.estado_id !== auditoriaPadreActual.estado_id
    ) {
      await this.estadoAuditoriaPadreService.post({
        auditoria_padre_id: id,
        estado_id: auditoriaPadreDTO.estado_id,
        usuario_id: null,
        usuario_rol: null,
        observacion: 'Cambio de estado',
        actual: true,
        fase_id: null,
        fecha_ejecucion_estado: auditoriaPadreDTO.fecha_modificacion,
        activo: true,
      });
    }

    const update = await this.AuditoriaPadreModel.findByIdAndUpdate(
      id,
      auditoriaPadreDTO,
      { new: true },
    ).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<AuditoriaPadre> {
    const deleted = await this.AuditoriaPadreModel.findByIdAndUpdate(
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
    return await this.AuditoriaPadreModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }
}
