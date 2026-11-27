import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { EjecutorDependencia } from './schema/ejecutor-dependencia.schema';
import { EjecutorDependenciaDto } from './dto/ejecutor-dependencia.dto';

/** Máximo de ejecutores activos por dependencia (issue #963). */
export const MAX_EJECUTORES_POR_DEPENDENCIA = 3;

@Injectable()
export class EjecutorDependenciaService {
  constructor(
    @InjectModel(EjecutorDependencia.name)
    private readonly ejecutorDependenciaModel: Model<EjecutorDependencia>,
  ) {}

  /**
   * Reglas de negocio de la asignación de ejecutores (issue #963), aplicadas en
   * el CRUD para que no se puedan omitir por peticiones directas ni por
   * asignaciones simultáneas:
   *  1. Cupo: máximo 3 ejecutores activos por dependencia.
   *  2. Exclusividad: un usuario no puede estar activo como ejecutor en más de
   *     una dependencia (ni duplicado en la misma).
   * `exceptId` excluye el propio registro al validar una modificación/reactivación.
   */
  private async validarReglasAsignacion(
    dependenciaId: number,
    usuarioId: number,
    exceptId?: string,
  ): Promise<void> {
    // La asignación vigente se identifica por `activo:true` (marca canónica que
    // deja el borrado lógico); no se exige `actual` para no depender de que
    // registros previos lo tuvieran seteado.
    const base = { activo: true };
    const noYoMismo = exceptId ? { _id: { $ne: exceptId } } : {};

    // Exclusividad: ninguna otra asignación activa del usuario (en esta u otra
    // dependencia). Cubre también el duplicado dentro de la misma dependencia.
    const asignacionUsuario = await this.ejecutorDependenciaModel
      .findOne({ ...base, ...noYoMismo, usuario_id: usuarioId })
      .lean()
      .exec();
    if (asignacionUsuario) {
      if (asignacionUsuario.dependencia_id === dependenciaId) {
        throw new BadRequestException(
          'El usuario ya está asignado como ejecutor en esta dependencia.',
        );
      }
      throw new BadRequestException(
        'El usuario ya es ejecutor activo en otra dependencia. Un usuario solo puede ser ejecutor de una dependencia a la vez.',
      );
    }

    // Cupo: máximo de ejecutores activos por dependencia.
    const activosEnDependencia = await this.ejecutorDependenciaModel
      .countDocuments({ ...base, ...noYoMismo, dependencia_id: dependenciaId })
      .exec();
    if (activosEnDependencia >= MAX_EJECUTORES_POR_DEPENDENCIA) {
      throw new BadRequestException(
        `La dependencia ya tiene el máximo de ${MAX_EJECUTORES_POR_DEPENDENCIA} ejecutores activos. Retira uno antes de asignar otro.`,
      );
    }
  }

  async post(dto: EjecutorDependenciaDto): Promise<EjecutorDependencia> {
    const fecha = new Date();

    await this.validarReglasAsignacion(dto.dependencia_id, dto.usuario_id);

    const data: EjecutorDependenciaDto = {
      ...dto,
      usuario_rol: dto.usuario_rol ?? 'ejecutor',
      actual: dto.actual ?? true,
      activo: true,
      fecha_asignacion: dto.fecha_asignacion ?? fecha,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    return await this.ejecutorDependenciaModel.create(data);
  }

  async getAll(filterDto: FilterDto): Promise<EjecutorDependencia[]> {
    const filtersService = new FiltersService(filterDto);
    return (await this.ejecutorDependenciaModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .lean()
      .exec()) as unknown as EjecutorDependencia[];
  }

  async getById(id: string): Promise<EjecutorDependencia> {
    const ejecutor = await this.ejecutorDependenciaModel.findById(id).exec();
    if (!ejecutor) {
      throw new Error(`${id} no existe`);
    }
    return ejecutor;
  }

  async put(
    id: string,
    dto: EjecutorDependenciaDto,
  ): Promise<EjecutorDependencia> {
    const actual = await this.ejecutorDependenciaModel.findById(id).exec();
    if (!actual) {
      throw new Error(`${id} no existe`);
    }

    // Si la modificación deja (o reactiva) el registro como asignación vigente
    // (activo:true), se revalidan cupo y exclusividad excluyendo el propio registro.
    const quedaVigente = (dto.activo ?? actual.activo) === true;
    if (quedaVigente) {
      await this.validarReglasAsignacion(
        dto.dependencia_id ?? actual.dependencia_id,
        dto.usuario_id ?? actual.usuario_id,
        id,
      );
    }

    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    const update = await this.ejecutorDependenciaModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  /**
   * Consulta para el job de vigencia (issue #963): desactiva las asignaciones de
   * ejecutor cuya habilitación ya venció (`fecha_fin <= ahora`) y que todavía
   * están vigentes. Es idempotente: solo toca registros `activo:true` (los ya
   * desactivados no se reprocesan) y conserva el historial dejándolos como
   * `activo:false, actual:false`. Devuelve cuántos se desactivaron.
   */
  async desactivarVencidos(
    referencia?: Date,
  ): Promise<{ desactivados: number }> {
    const ahora = referencia ?? new Date();
    const resultado = await this.ejecutorDependenciaModel
      .updateMany(
        {
          activo: true,
          fecha_fin: { $ne: null, $lte: ahora },
        },
        {
          $set: {
            activo: false,
            actual: false,
            fecha_modificacion: new Date(),
          },
        },
      )
      .exec();
    return { desactivados: resultado.modifiedCount ?? 0 };
  }

  async delete(id: string): Promise<EjecutorDependencia> {
    const deleted = await this.ejecutorDependenciaModel
      .findByIdAndUpdate(
        id,
        { activo: false, actual: false, fecha_modificacion: new Date() },
        { new: true },
      )
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.ejecutorDependenciaModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
