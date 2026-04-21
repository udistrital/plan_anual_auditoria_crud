import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { PlanAuditoria } from './schemas/plan-auditoria.schema';
import { PlanAuditoriaDTO } from './dto/plan-auditoria.dto';
import { AuditoriaPadreService } from '../auditoria-padre/auditoria-padre.service';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { GenerarAuditoriaDto } from '../auditoria-padre/dto/generar-auditoria.dto';

@Injectable()
export class PlanAuditoriaService {
  constructor(
    @InjectModel(PlanAuditoria.name)
    private readonly planAuditoriaModel: Model<PlanAuditoria>,
    private readonly auditoriaPadreService: AuditoriaPadreService,
  ) {}

  async post(planAuditoriaDto: PlanAuditoriaDTO): Promise<PlanAuditoria> {
    const fecha = new Date();

    const existingPlan = await this.planAuditoriaModel.findOne({
      vigencia_id: planAuditoriaDto.vigencia_id,
      activo: true,
    });
    if (existingPlan) {
      throw new Error(
        `Ya existe un plan de auditoría activo para la vigencia ${planAuditoriaDto.vigencia_id}`,
      );
    }

    const planAuditoriaData: PlanAuditoriaDTO = {
      ...planAuditoriaDto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    return await this.planAuditoriaModel.create(planAuditoriaData);
  }

  async getAll(filterDto: FilterDto): Promise<PlanAuditoria[]> {
    const filtersService = new FiltersService(filterDto);
    return (await this.planAuditoriaModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .lean()
      .exec()) as unknown as PlanAuditoria[];
  }

  async getById(id: string): Promise<PlanAuditoria> {
    const planAuditoria = await this.planAuditoriaModel.findById(id).exec();
    if (!planAuditoria) {
      throw new Error(`${id} no existe`);
    }
    return planAuditoria;
  }

  async put(
    id: string,
    planAuditoriaDto: PlanAuditoriaDTO,
  ): Promise<PlanAuditoria> {
    planAuditoriaDto.fecha_modificacion = new Date();

    if (planAuditoriaDto.vigencia_id) {
      const existingPlan = await this.planAuditoriaModel.findOne({
        vigencia_id: planAuditoriaDto.vigencia_id,
        _id: { $ne: id },
        activo: true,
      });
      if (existingPlan) {
        throw new Error(
          `Ya existe un plan de auditoría activo para la vigencia ${planAuditoriaDto.vigencia_id}`,
        );
      }
    }

    if (planAuditoriaDto.fecha_creacion) {
      delete planAuditoriaDto.fecha_creacion;
    }
    const update = await this.planAuditoriaModel
      .findByIdAndUpdate(id, planAuditoriaDto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<PlanAuditoria> {
    const deleted = await this.planAuditoriaModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }
  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);

    return await this.planAuditoriaModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }

  /**
   * Genera las auditorías correspondientes a un plan de auditoría, a partir de sus auditorías padre. Para cada auditoría generada, también se genera su estado inicial y se actualiza el estado de su auditoría padre.
   * @param id Id del plan de auditoría para el cual se generarán las auditorías.
   * @param generarAuditoriaDto DTO con la información necesaria para la generación de las auditorías y sus estados.
   * @returns Lista de auditorías generadas.
   * @throws Error si el plan de auditoría no existe.
   * @throws Error si ocurre un error al generar alguna de las auditorías o sus estados.
   */
  async generarAuditorias(
    id: string,
    generarAuditoriaDto: GenerarAuditoriaDto,
  ): Promise<Auditoria[]> {
    // Para lanzar error específico en caso de que el plan de auditoría no exista.
    await this.getById(id);

    const auditoriasPadre = await this.auditoriaPadreService.getAll({
      fields: undefined,
      sortby: undefined,
      order: undefined,
      populate: undefined,

      query: `plan_auditoria_id:${id},activo:true,estado_id:${generarAuditoriaDto.estado_id_padre_actual}`,
      limit: '0',
      offset: '0',
    });

    const nuevasAuditorias: Auditoria[] = [];

    // Delegar la generación de cada auditoría padre al servicio centralizado.
    for (const auditoriaPadre of auditoriasPadre) {
      const auditoriasGeneradasPadre =
        await this.auditoriaPadreService.generarAuditorias(
          auditoriaPadre._id.toString(),
          generarAuditoriaDto,
        );
      nuevasAuditorias.push(...auditoriasGeneradasPadre);
    }

    return nuevasAuditorias;
  }
}
