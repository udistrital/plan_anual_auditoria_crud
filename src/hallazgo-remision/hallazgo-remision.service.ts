import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { HallazgoRemision } from './schema/hallazgo-remision.schema';
import { HallazgoRemisionDTO } from './dto/hallazgo-remision.dto';
import { Hallazgo } from '../hallazgo/schemas/hallazgo.schema';

@Injectable()
export class HallazgoRemisionService {
  constructor(
    @InjectModel(HallazgoRemision.name)
    private readonly hallazgoRemisionModel: Model<HallazgoRemision>,
    @InjectModel(Hallazgo.name)
    private readonly hallazgoModel: Model<Hallazgo>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'hallazgo_id' }];
  }

  private async checkRelated(
    hallazgoRemisionDTO: HallazgoRemisionDTO,
  ): Promise<void> {
    if (hallazgoRemisionDTO.hallazgo_id) {
      const hallazgo = await this.hallazgoModel
        .findById(hallazgoRemisionDTO.hallazgo_id)
        .exec();
      if (!hallazgo) {
        throw new Error(
          `Hallazgo relacionado con id ${hallazgoRemisionDTO.hallazgo_id} no existe`,
        );
      }
    }
  }

  async post(
    hallazgoRemisionDto: HallazgoRemisionDTO,
  ): Promise<HallazgoRemision> {
    const fecha = new Date();
    const hallazgoRemisionData: HallazgoRemisionDTO = {
      ...hallazgoRemisionDto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    await this.checkRelated(hallazgoRemisionDto);
    return await this.hallazgoRemisionModel.create(hallazgoRemisionData);
  }

  async getAll(filterDto: FilterDto): Promise<HallazgoRemision[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.hallazgoRemisionModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as HallazgoRemision[];
  }

  async getById(id: string): Promise<HallazgoRemision> {
    const hallazgoRemision = await this.hallazgoRemisionModel
      .findById(id)
      .exec();
    if (!hallazgoRemision) {
      throw new Error(`${id} no existe`);
    }
    return hallazgoRemision;
  }

  async put(
    id: string,
    hallazgoRemisionDto: HallazgoRemisionDTO,
  ): Promise<HallazgoRemision> {
    hallazgoRemisionDto.fecha_modificacion = new Date();
    if (hallazgoRemisionDto.fecha_creacion) {
      delete hallazgoRemisionDto.fecha_creacion;
    }
    await this.checkRelated(hallazgoRemisionDto);
    const update = await this.hallazgoRemisionModel
      .findByIdAndUpdate(id, hallazgoRemisionDto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<HallazgoRemision> {
    const deleted = await this.hallazgoRemisionModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.hallazgoRemisionModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
