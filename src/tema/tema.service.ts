import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Tema } from './schemas/tema.schema';
import { Hallazgo } from '../hallazgo/schemas/hallazgo.schema';
import { TemaDTO, UpdateTemaDTO } from './dto/tema.dto';
import { CreateSubtemaDTO, UpdateSubtemaDTO } from './dto/subtema.dto';

@Injectable()
export class TemaService {
  constructor(
    @InjectModel(Tema.name)
    private readonly TemaModel: Model<Tema>,
    @InjectModel(Hallazgo.name)
    private readonly HallazgoModel: Model<Hallazgo>,
  ) {}

  private populateFields(): any[] {
    return [{ path: '' }];
  }

  // ============================================
  // MÉTODOS CRUD DE TEMA
  // ============================================

  async post(TemaDTO: TemaDTO): Promise<Tema> {
    const fecha = new Date();
    const temaData: TemaDTO = {
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
    });
    return await tema.save();
  }

  async getAllSubtemas(filterDto: FilterDto): Promise<any[]> {
    const filtersService = new FiltersService(filterDto);
    const query = filtersService.getQuery();

    let temaIdFilter = null;
    if (query && query['tema_id']) {
      temaIdFilter = query['tema_id'];
      delete query['tema_id'];
    }

    const baseFilter: any = {};
    if (temaIdFilter) {
      baseFilter._id = temaIdFilter;
    }

    const temas = await this.TemaModel.find(baseFilter).lean().exec();

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
                descripcion_titulo: tema.descripcion_titulo,
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

    return {
      ...tema.subtema[0].toObject(),
      tema: {
        _id: tema._id,
        titulo: tema.titulo,
        descripcion_titulo: tema.descripcion_titulo,
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

    // Cascade: marcar como inactivos todos los hallazgos del subtema
    await this.HallazgoModel.updateMany(
      { subtema_id: subtemaId },
      { activo: false },
    ).exec();

    return await tema.save();
  }
}
