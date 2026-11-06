import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { EjecutorDependencia } from './schema/ejecutor-dependencia.schema';
import { EjecutorDependenciaDto } from './dto/ejecutor-dependencia.dto';

@Injectable()
export class EjecutorDependenciaService {
  constructor(
    @InjectModel(EjecutorDependencia.name)
    private readonly ejecutorDependenciaModel: Model<EjecutorDependencia>,
  ) {}

  async post(dto: EjecutorDependenciaDto): Promise<EjecutorDependencia> {
    const fecha = new Date();

    // Regla: no duplicar a la misma persona como ejecutor vigente de la misma
    // dependencia. Una dependencia sí admite varios ejecutores vigentes (distintos).
    const existe = await this.ejecutorDependenciaModel
      .exists({
        dependencia_id: dto.dependencia_id,
        usuario_id: dto.usuario_id,
        actual: true,
        activo: true,
      })
      .exec();
    if (existe) {
      throw new Error(
        `El usuario ${dto.usuario_id} ya es ejecutor vigente de la dependencia ${dto.dependencia_id}`,
      );
    }

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
