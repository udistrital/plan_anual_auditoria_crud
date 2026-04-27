import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Tema } from '../tema/schemas/tema.schema';
import { Hallazgo } from './schemas/hallazgo.schema';
import { CreateHallazgoDTO, UpdateHallazgoDTO } from './dto/hallazgo.dto';

@Injectable()
export class HallazgoService {
  constructor(
    @InjectModel(Hallazgo.name)
    private readonly HallazgoModel: Model<Hallazgo>,
    @InjectModel(Tema.name)
    private readonly TemaModel: Model<Tema>,
  ) {}

  async agregarHallazgo(
    createHallazgoDTO: CreateHallazgoDTO,
  ): Promise<Hallazgo> {
    const tema = await this.TemaModel.findOne({
      'subtema._id': createHallazgoDTO.subtema_id,
    }).exec();
    if (!tema) {
      throw new Error(`Subtema ${createHallazgoDTO.subtema_id} no existe`);
    }
    return await this.HallazgoModel.create({
      ...createHallazgoDTO,
      rechazado: createHallazgoDTO.rechazado ?? false,
      activo: createHallazgoDTO.activo ?? true,
    });
  }

  async getAllHallazgos(filterDto: FilterDto): Promise<Hallazgo[]> {
    const filtersService = new FiltersService(filterDto);
    return (await this.HallazgoModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .lean()
      .exec()) as unknown as Hallazgo[];
  }

  async countHallazgos(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.HallazgoModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }

  async getHallazgoById(hallazgoId: string): Promise<Hallazgo> {
    const hallazgo = await this.HallazgoModel.findById(hallazgoId).exec();
    if (!hallazgo) {
      throw new Error(`Hallazgo ${hallazgoId} no existe`);
    }
    return hallazgo;
  }

  async updateHallazgo(
    hallazgoId: string,
    updateHallazgoDTO: UpdateHallazgoDTO,
  ): Promise<Hallazgo> {
    const updated = await this.HallazgoModel.findByIdAndUpdate(
      hallazgoId,
      updateHallazgoDTO,
      { new: true },
    ).exec();
    if (!updated) {
      throw new Error(`Hallazgo ${hallazgoId} no existe`);
    }
    return updated;
  }

  async deleteHallazgo(hallazgoId: string): Promise<Hallazgo> {
    const deleted = await this.HallazgoModel.findByIdAndUpdate(
      hallazgoId,
      { activo: false },
      { new: true },
    ).exec();
    if (!deleted) {
      throw new Error(`Hallazgo ${hallazgoId} no existe`);
    }
    return deleted;
  }
}
