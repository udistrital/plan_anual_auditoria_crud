import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { PlanAuditoria } from './schemas/plan-auditoria.schema';
import { PlanAuditoriaDTO } from './dto/plan-auditoria.dto';
import { AuditoriaPadreService } from '../auditoria-padre/auditoria-padre.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { GenerarAuditoriaDto } from './dto/generar-auditoria.dto';
import { EstadoAuditoriaService } from '../auditoria-estado/auditoria-estado.service';
import { AuditoriaEstadoDto } from '../auditoria-estado/dto/auditoria-estado.dto';

@Injectable()
export class PlanAuditoriaService {
  constructor(
    @InjectModel(PlanAuditoria.name)
    private readonly planAuditoriaModel: Model<PlanAuditoria>,
    private readonly auditoriaPadreService: AuditoriaPadreService,
    private readonly auditoriaService: AuditoriaService,
    private readonly auditoriaEstadoService: EstadoAuditoriaService,
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

    const planAuditoriaData = {
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

    const prototipoAuditoriaEstado: AuditoriaEstadoDto = {
      auditoria_id: undefined, // Se asigna en la iteración
      actual: undefined,
      activo: undefined,
      fecha_ejecucion_estado: undefined,

      usuario_id: generarAuditoriaDto.usuario_id,
      usuario_rol: generarAuditoriaDto.usuario_rol,
      observacion: generarAuditoriaDto.observacion,
      estado_id: generarAuditoriaDto.estado_id_hija_nuevo,
      fase_id: generarAuditoriaDto.fase_id,
    };

    // Variables de retorno e iteración
    const nuevasAuditorias: Auditoria[] = [];
    const auditoriasPadre = await this.auditoriaPadreService.getAll({
      fields: undefined,
      sortby: undefined,
      order: undefined,
      populate: undefined,

      query: `plan_auditoria_id:${id},activo:true,estado_id:${generarAuditoriaDto.estado_id_padre_actual}`,
      limit: '0',
      offset: '0',
    });

    // Generar auditorías hija para cada auditoría padre y actualizar estado de auditoría padre
    for (const auditoriaPadre of auditoriasPadre) {
      // Para evitar la creación de auditorías hijas duplicadas
      const auditoriasHijasExistentes = await this.auditoriaService.getAll({
        fields: undefined,
        sortby: undefined,
        order: undefined,
        populate: undefined,

        query: `auditoria_padre_id:${auditoriaPadre._id},activo:true`,
        limit: '0',
        offset: '0',
      });

      // Crear estados de las auditorías hijas existentes si no existen.
      const idsHijasExistentes = auditoriasHijasExistentes
        .map((a) => a._id.toString())
        .join(',');
      const estadosAuditoriaExistentes =
        await this.auditoriaEstadoService.getAll({
          fields: undefined,
          sortby: undefined,
          order: undefined,
          populate: undefined,

          query: `auditoria_id__in:${idsHijasExistentes},estado_id:${generarAuditoriaDto.estado_id_hija_nuevo},activo:true`,
          limit: '0',
          offset: '0',
        });

      // Filtrar auditorías hijas existentes para identificar cuáles no tienen estado generado.
      const auditoriasHijasSinEstado = auditoriasHijasExistentes.filter(
        (a) =>
          !estadosAuditoriaExistentes.find(
            (e) => e.auditoria_id === a._id.toString(),
          ),
      );
      for (const auditoriaHijaSinEstado of auditoriasHijasSinEstado) {
        try {
          await this.auditoriaEstadoService.post({
            ...prototipoAuditoriaEstado,
            auditoria_id: auditoriaHijaSinEstado._id.toString(),
          });
        } catch (error) {
          const newError = new Error(
            `Error al generar estado de auditoría hija existente ${auditoriaHijaSinEstado._id} de auditoríaPadre ${auditoriaPadre._id} (${auditoriaPadre.titulo}).`,
          );
          newError.stack += error.stack;
          throw newError;
        }
      }

      // Generación de auditorías hijas faltantes y sus estados
      const cantidadACrear =
        auditoriaPadre.cantidad_auditorias - auditoriasHijasExistentes.length;
      for (let i = 0; i < cantidadACrear; i++) {
        let auditoria: Auditoria;

        // 1. Generar la nueva auditoría.
        try {
          auditoria = await this.auditoriaService.post({
            no_auditoria: undefined,
            consecutivo_OCI: undefined,
            cronograma_id: undefined,
            estado_id: undefined,
            macroproceso_id: undefined,
            proceso_id: undefined,
            dependencia_id: undefined,
            consecutivo_IE: undefined,
            fecha_inicio: undefined,
            fecha_fin: undefined,
            titulo: undefined,
            objetivo: undefined,
            alcance: undefined,
            criterio: undefined,
            rec_tecnologico: undefined,
            rec_humano: undefined,
            rec_fisico: undefined,
            temas: undefined,
            correo_complementario: undefined,
            tipo_evaluacion_id: undefined,
            activo: undefined,
            fecha_creacion: undefined,
            fecha_modificacion: undefined,

            plan_auditoria_id: id,
            auditoria_padre_id: auditoriaPadre._id,
            vigencia_id: auditoriaPadre.vigencia_id,
          });

          nuevasAuditorias.push(auditoria);
        } catch (error) {
          const newError = new Error(
            `Error al generar auditoría ${i + 1} de auditoríaPadre ${auditoriaPadre._id} (${auditoriaPadre.titulo}).`,
          );
          newError.stack += error.stack;
          throw newError;
        }

        // 2. Generar el estado de la nueva auditoría
        try {
          await this.auditoriaEstadoService.post({
            ...prototipoAuditoriaEstado,
            auditoria_id: auditoria._id.toString(),
          });
        } catch (error) {
          const newError = new Error(
            `Error al generar estado de auditoría ${i + 1} de auditoríaPadre ${auditoriaPadre._id} (${auditoriaPadre.titulo}).`,
          );
          newError.stack += error.stack;
          throw newError;
        }
      }

      // Actualiza estado auditoría padre
      try {
        // TODO: Actualizar estado de auditoría padre a aprobada
        await this.mockPruebaUnitariaActualizarEstadoAuditoriaPadre();
      } catch (error) {
        const newError = new Error(
          `Error al actualizar estado de auditoríaPadre ${auditoriaPadre._id} (${auditoriaPadre.titulo}) después de generar sus auditorías.`,
        );
        newError.stack += error.stack;
        throw newError;
      }
    }

    return nuevasAuditorias;
  }

  // TODO: Eliminar este método y su llamada cuando se fusionen cambios estado auditoría padre
  async mockPruebaUnitariaActualizarEstadoAuditoriaPadre() {}
}
