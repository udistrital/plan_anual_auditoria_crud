import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { AuditoriaPadre } from './schemas/auditoria-padre.schema';
import { AuditoriaPadreDTO } from './dto/auditoria-padre.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';
import { EstadoAuditoriaPadreService } from '../auditoria-padre-estado/auditoria-padre-estado.service';
import { GenerarAuditoriaDto } from './dto/generar-auditoria.dto';
import { Auditoria } from 'src/auditoria/schemas/auditoria.schema';
import { AuditoriaService } from 'src/auditoria/auditoria.service';
import { AuditoriaEstadoDto } from 'src/auditoria-estado/dto/auditoria-estado.dto';
import { EstadoAuditoriaService } from 'src/auditoria-estado/auditoria-estado.service';
import { stringify } from 'querystring';

@Injectable()
export class AuditoriaPadreService {
  constructor(
    @InjectModel(AuditoriaPadre.name)
    private readonly AuditoriaPadreModel: Model<AuditoriaPadre>,
    @InjectModel(PlanAuditoria.name)
    private readonly PlanAuditoriaModel: Model<PlanAuditoria>,
    private readonly estadoAuditoriaPadreService: EstadoAuditoriaPadreService,
    private readonly auditoriaService: AuditoriaService,
    private readonly auditoriaEstadoService: EstadoAuditoriaService,
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

  /**
   * Generar las auditorías correspondientes a una auditoría padre. Para cada auditoría generada, también se genera su estado inicial y se acutaliza el estado de la auditoría padre.
   * @param id Id de la auditoría padre para la cual se generarán las adutirías hijas.
   * @param generarAuditoriaDto DTO con la información necesaria para la generación de las auditorías y sus estados.
   * @returns Lista de auditorías generadas.
   * @throws Error si la auditoría padre no existe.
   * @throws Error si la auditoría padre no tiene una cantidad de auditorías asignada.
   * @throws Error si ocurre un error al generar alguna de las auditorías o sus estados.
   */
  async generarAuditorias(id: string, generarAuditoriaDto: GenerarAuditoriaDto): Promise<Auditoria[]> {
    // Si la auditoría padre no existe, se lanza un error para evitar generar auditorías hijas sin una padre válido.
    const auditoriaPadre = await this.getById(id);
    if (!auditoriaPadre.cantidad_auditorias) {
      throw new Error(`La auditoría padre con ID ${id} no tiene una cantidad de auditorías asignada.`);
    }

    // Variable de retorno
    const nuevasAuditorias: Auditoria[] = [];

    // Crear prototipos de los estados de auditoría hija para evitar repetir código en la iteración.
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

    // Para evitar la creación de auditorías hijas duplicadas
    const auditoriasHijasExistentes = await this.auditoriaService.getAll({
      fields: undefined,
      sortby: undefined,
      order: undefined,
      populate: undefined,

      query: `auditoria_padre_id:${id},activo:true`,
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
      const auditoriaGenerada = await this.generarAuditoria(i, auditoriaPadre, prototipoAuditoriaEstado);
      nuevasAuditorias.push(auditoriaGenerada);
    }

    // Actualiza estado auditoría padre
    try {
      await this.estadoAuditoriaPadreService.post({
        actual: undefined,
        fecha_ejecucion_estado: undefined,
        activo: undefined,

        auditoria_padre_id: auditoriaPadre._id.toString(),
        usuario_id: generarAuditoriaDto.usuario_id,
        usuario_rol: generarAuditoriaDto.usuario_rol,
        observacion: generarAuditoriaDto.observacion,
        estado_id: generarAuditoriaDto.estado_id_padre_nuevo,
        fase_id: generarAuditoriaDto.fase_id,
      });
    } catch (error) {
      const newError = new Error(
        `Error al actualizar estado de auditoríaPadre ${auditoriaPadre._id} (${auditoriaPadre.titulo}) después de generar sus auditorías.`,
      );
      newError.stack += error.stack;
      throw newError;
    }

    return nuevasAuditorias;
  }

  /**
   * Genera una auditoría hija a partir de una auditoría padre, si el número de auditorías hijas existentes es menor que la cantidad_auditoria especificada en la auditoría padre.
   * @param id Id de la auditoría padre para la cual se generará la auditoría hija.
   * @param generarAuditoriaDto DTO con la información necesaria para la generación de la auditoría hija y su estado, así como para la actualización del estado de la auditoría padre.
   * @returns Auditoría hija generada.
   * @throws Error si la auditoría padre no existe.
   * @throws Error si la auditoría padre no tiene una cantidad de auditorías asignada.
   * @throws Error si la auditoría padre ya tiene el número máximo de auditorías hijas generadas.
   * @throws Error si ocurre un error al generar la auditoría hija o su estado.
   */
  async generarUnaAuditoria(id: string, generarAuditoriaDto: GenerarAuditoriaDto): Promise<Auditoria> {
    const auditoriaPadre = await this.getById(id);
    if (!auditoriaPadre.cantidad_auditorias) {
      throw new Error(`La auditoría padre con ID ${id} no tiene una cantidad de auditorías asignada.`);
    }

    const prototipoAuditoriaEstado: AuditoriaEstadoDto = {
      auditoria_id: undefined, // Se asigna en la generación
      actual: undefined,
      activo: undefined,
      fecha_ejecucion_estado: undefined,

      usuario_id: generarAuditoriaDto.usuario_id,
      usuario_rol: generarAuditoriaDto.usuario_rol,
      observacion: generarAuditoriaDto.observacion,
      estado_id: generarAuditoriaDto.estado_id_hija_nuevo,
      fase_id: generarAuditoriaDto.fase_id,
    };

    const auditoriasHijasExistentes = await this.auditoriaService.getAll({
      fields: undefined,
      sortby: undefined,
      order: undefined,
      populate: undefined,

      query: `auditoria_padre_id:${id},activo:true`,
      limit: '0',
      offset: '0',
    });

    if (auditoriasHijasExistentes.length >= auditoriaPadre.cantidad_auditorias) {
      throw new Error(`La auditoría padre con ID ${id} ya tiene el número máximo de auditorías hijas generadas.`);
    }

    return await this.generarAuditoria(auditoriasHijasExistentes.length, auditoriaPadre, prototipoAuditoriaEstado);
  }

  /**
   * Genera una auditoría hija a partir de una auditoría padre, y su estado inicial. Esta función es utilizada en la generación individual y masiva de auditorías hijas para evitar repetir código.
   * @param i Índice de la auditoría hija a generar, usado para mensajes de error.
   * @param auditoriaPadre Auditoría padre a partir de la cual se generará la auditoría hija.
   * @param prototipoAuditoriaEstado Prototipo del estado de la auditoría.
   * @returns Promesa con la auditoría generada.
   * @throws Error si ocurre un error al generar la auditoría o su estado.
   */
  private async generarAuditoria(i: number, auditoriaPadre: AuditoriaPadre, prototipoAuditoriaEstado: AuditoriaEstadoDto): Promise<Auditoria> {
    let auditoria: Auditoria;

    // 1. Generar la nueva auditoría.
    try {
      auditoria = await this.auditoriaService.post({
        consecutivo_no_auditoria: undefined,
        consecutivo_OCI: undefined,
        cronograma_id: undefined,
        subtitulo: undefined,
        estado_id: undefined,
        consecutivo_IE: undefined,
        fecha_inicio: undefined,
        fecha_fin: undefined,
        objetivo: undefined,
        alcance: undefined,
        criterio: undefined,
        rec_tecnologico: undefined,
        rec_humano: undefined,
        rec_fisico: undefined,
        tema: undefined,
        correo_complementario: undefined,
        activo: undefined,
        fecha_creacion: undefined,
        fecha_modificacion: undefined,

        plan_auditoria_id: auditoriaPadre.plan_auditoria_id?.toString() || undefined,
        auditoria_padre_id: auditoriaPadre._id,
        vigencia_id: auditoriaPadre.vigencia_id,
      });

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

    return auditoria;
  }

}
