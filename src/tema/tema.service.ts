import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Tema } from './schemas/tema.schema';
import { TemaDTO, UpdateTemaDTO } from './dto/tema.dto';
import { CreateSubtemaDTO, UpdateSubtemaDTO } from './dto/subtema.dto';
import { CreateHallazgoDTO, UpdateHallazgoDTO } from './dto/hallazgo.dto';

@Injectable()
export class TemaService {
  constructor(
    @InjectModel(Tema.name)
    private readonly TemaModel: Model<Tema>,
  ) {}

  private populateFields(): any[] {
    return [{ path: '' }];
  }

  // ============================================
  // MÉTODOS CRUD DE TEMA
  // ============================================

  async post(TemaDTO: TemaDTO): Promise<Tema> {
    const fecha = new Date();
    const temaData = {
      ...TemaDTO,
      activo: true,
      fecha_creacion: fecha,
    };
    return await this.TemaModel.create(temaData);
  }

  async getAll(filterDto: FilterDto): Promise<Tema[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.TemaModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as Tema[];
  }

  async getById(id: string): Promise<Tema> {
    const tema = await this.TemaModel.findById(id).exec();
    if (!tema) {
      throw new Error(`Tema ${id} no existe`);
    }
    return tema;
  }

  async put(id: string, updateTemaDTO: UpdateTemaDTO): Promise<Tema> {
    const update = await this.TemaModel.findByIdAndUpdate(id, updateTemaDTO, {
      new: true,
    }).exec();
    if (!update) {
      throw new Error(`Tema ${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<Tema> {
    const deleted = await this.TemaModel.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true },
    ).exec();
    if (!deleted) {
      throw new Error(`Tema ${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.TemaModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }

  // ============================================
  // MÉTODOS PARA SUBTEMA
  // ============================================

  async agregarSubtema(
    temaId: string,
    createSubtemaDTO: CreateSubtemaDTO,
  ): Promise<Tema> {
    const tema = await this.TemaModel.findById(temaId).exec();
    if (!tema) {
      throw new Error(`Tema ${temaId} no existe`);
    }

    tema.subtema.push({
      titulo: createSubtemaDTO.titulo,
      activo: createSubtemaDTO.activo ?? true,
      hallazgo: [],
    });
    return await tema.save();
  }

  async getAllSubtemas(filterDto: FilterDto): Promise<any[]> {
    const filtersService = new FiltersService(filterDto);
    const query = filtersService.getQuery();

    // Extraer tema_id de la query si existe
    let temaIdFilter = null;
    if (query && query['tema_id']) {
      temaIdFilter = query['tema_id'];
      delete query['tema_id'];
    }

    // Construir el filtro base
    const baseFilter: any = {};
    if (temaIdFilter) {
      baseFilter._id = temaIdFilter;
    }

    // Buscar temas que coincidan con el filtro
    const temas = await this.TemaModel.find(baseFilter).lean().exec();

    // Extraer y aplanar todos los subtemas
    const allSubtemas = [];
    for (const tema of temas) {
      if (tema.subtema && tema.subtema.length > 0) {
        tema.subtema.forEach((subtema: any) => {
          if (subtema.activo) {
            allSubtemas.push({
              ...subtema,
              tema: {
                _id: tema._id,
                titulo: tema.titulo,
              },
            });
          }
        });
      }
    }

    return allSubtemas;
  }

  async countSubtemas(filterDto: FilterDto): Promise<number> {
    const subtemas = await this.getAllSubtemas(filterDto);
    return subtemas.length;
  }

  async getSubtemaById(subtemaId: string): Promise<any> {
    const tema = await this.TemaModel.findOne(
      { 'subtema._id': subtemaId },
      {
        'subtema.$': 1,
        titulo: 1,
        _id: 1,
      },
    ).exec();

    if (!tema || !tema.subtema || tema.subtema.length === 0) {
      throw new Error(`Subtema ${subtemaId} no existe`);
    }

    // Retornar el subtema con información del tema padre
    return {
      ...tema.subtema[0].toObject(),
      tema: {
        _id: tema._id,
        titulo: tema.titulo,
      },
    };
  }

  async updateSubtema(
    subtemaId: string,
    updateSubtemaDTO: UpdateSubtemaDTO,
  ): Promise<Tema> {
    const tema = await this.TemaModel.findOne({
      'subtema._id': subtemaId,
    }).exec();

    if (!tema) {
      throw new Error(`Subtema ${subtemaId} no existe`);
    }

    const subtema = tema.subtema.id(subtemaId);
    if (!subtema) {
      throw new Error(`Subtema ${subtemaId} no existe`);
    }

    // Actualizar solo los campos proporcionados (sin activo)
    if (updateSubtemaDTO.titulo !== undefined) {
      subtema.titulo = updateSubtemaDTO.titulo;
    }

    return await tema.save();
  }

  async deleteSubtema(subtemaId: string): Promise<Tema> {
    const tema = await this.TemaModel.findOne({
      'subtema._id': subtemaId,
    }).exec();

    if (!tema) {
      throw new Error(`Subtema ${subtemaId} no existe`);
    }

    const subtema = tema.subtema.id(subtemaId);
    if (!subtema) {
      throw new Error(`Subtema ${subtemaId} no existe`);
    }

    subtema.activo = false;

    // También marcar como inactivos todos los hallazgos del subtema
    subtema.hallazgo.forEach((h) => (h.activo = false));

    return await tema.save();
  }

  // ============================================
  // MÉTODOS PARA HALLAZGO
  // ============================================

  async agregarHallazgo(
    subtemaId: string,
    createHallazgoDTO: CreateHallazgoDTO,
  ): Promise<Tema> {
    const tema = await this.TemaModel.findOne({
      'subtema._id': subtemaId,
    }).exec();

    if (!tema) {
      throw new Error(`Subtema ${subtemaId} no existe`);
    }

    const subtema = tema.subtema.id(subtemaId);
    if (!subtema) {
      throw new Error(`Subtema ${subtemaId} no existe`);
    }

    subtema.hallazgo.push({
      titulo: createHallazgoDTO.titulo,
      criterio: createHallazgoDTO.criterio,
      descripcion: createHallazgoDTO.descripcion,
      activo: createHallazgoDTO.activo ?? true,
    });

    return await tema.save();
  }

  async getAllHallazgos(filterDto: FilterDto): Promise<any[]> {
    const filtersService = new FiltersService(filterDto);
    const query = filtersService.getQuery();

    // Extraer subtema_id de la query si existe
    let subtemaIdFilter = null;
    if (query && query['subtema_id']) {
      subtemaIdFilter = query['subtema_id'];
      delete query['subtema_id'];
    }

    // Construir el filtro base
    const baseFilter: any = {};
    if (subtemaIdFilter) {
      baseFilter['subtema._id'] = subtemaIdFilter;
    }

    // Buscar temas que tengan subtemas
    const temas = await this.TemaModel.find(baseFilter).lean().exec();

    // Extraer y aplanar todos los hallazgos
    const allHallazgos = [];
    for (const tema of temas) {
      if (tema.subtema && tema.subtema.length > 0) {
        for (const subtema of tema.subtema) {
          // Si hay filtro de subtema_id, solo procesar ese subtema
          if (
            subtemaIdFilter &&
            subtema._id.toString() !== subtemaIdFilter.toString()
          ) {
            continue;
          }

          if (subtema.hallazgo && subtema.hallazgo.length > 0) {
            subtema.hallazgo.forEach((hallazgo: any) => {
              if (hallazgo.activo) {
                allHallazgos.push({
                  ...hallazgo,
                  subtema: {
                    _id: subtema._id,
                    titulo: subtema.titulo,
                  },
                  tema: {
                    _id: tema._id,
                    titulo: tema.titulo,
                  },
                });
              }
            });
          }
        }
      }
    }

    return allHallazgos;
  }

  async countHallazgos(filterDto: FilterDto): Promise<number> {
    const hallazgos = await this.getAllHallazgos(filterDto);
    return hallazgos.length;
  }

  async getHallazgoById(hallazgoId: string): Promise<any> {
    const tema = await this.TemaModel.findOne({
      'subtema.hallazgo._id': hallazgoId,
    }).exec();

    if (!tema) {
      throw new Error(`Hallazgo ${hallazgoId} no existe`);
    }

    // Buscar el hallazgo en los subtemas
    for (const subtema of tema.subtema) {
      const hallazgo = subtema.hallazgo.id(hallazgoId);
      if (hallazgo) {
        return {
          ...hallazgo.toObject(),
          subtema: {
            _id: subtema._id,
            titulo: subtema.titulo,
          },
          tema: {
            _id: tema._id,
            titulo: tema.titulo,
          },
        };
      }
    }

    throw new Error(`Hallazgo ${hallazgoId} no existe`);
  }

  async updateHallazgo(
    hallazgoId: string,
    updateHallazgoDTO: UpdateHallazgoDTO,
  ): Promise<Tema> {
    const tema = await this.TemaModel.findOne({
      'subtema.hallazgo._id': hallazgoId,
    }).exec();

    if (!tema) {
      throw new Error(`Hallazgo ${hallazgoId} no existe`);
    }

    // Buscar el hallazgo en los subtemas
    let hallazgoEncontrado = null;

    for (const subtema of tema.subtema) {
      const hallazgo = subtema.hallazgo.id(hallazgoId);
      if (hallazgo) {
        hallazgoEncontrado = hallazgo;
        break;
      }
    }

    if (!hallazgoEncontrado) {
      throw new Error(`Hallazgo ${hallazgoId} no existe`);
    }

    // Actualizar solo los campos proporcionados (sin activo)
    if (updateHallazgoDTO.titulo !== undefined) {
      hallazgoEncontrado.titulo = updateHallazgoDTO.titulo;
    }
    if (updateHallazgoDTO.criterio !== undefined) {
      hallazgoEncontrado.criterio = updateHallazgoDTO.criterio;
    }
    if (updateHallazgoDTO.descripcion !== undefined) {
      hallazgoEncontrado.descripcion = updateHallazgoDTO.descripcion;
    }

    return await tema.save();
  }

  async deleteHallazgo(hallazgoId: string): Promise<Tema> {
    const tema = await this.TemaModel.findOne({
      'subtema.hallazgo._id': hallazgoId,
    }).exec();

    if (!tema) {
      throw new Error(`Hallazgo ${hallazgoId} no existe`);
    }

    let hallazgoEncontrado = null;

    for (const subtema of tema.subtema) {
      const hallazgo = subtema.hallazgo.id(hallazgoId);
      if (hallazgo) {
        hallazgoEncontrado = hallazgo;
        break;
      }
    }

    if (!hallazgoEncontrado) {
      throw new Error(`Hallazgo ${hallazgoId} no existe`);
    }

    hallazgoEncontrado.activo = false;
    return await tema.save();
  }
}
