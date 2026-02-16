import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Informe } from './schemas/informe.schema';
import { InformeDTO } from './dto/informe.dto';
import { Tema } from '../tema/schemas/tema.schema';

@Injectable()
export class InformeService {
  constructor(
    @InjectModel(Informe.name)
    private readonly InformeModel: Model<Informe>,
    @InjectModel(Tema.name)
    private readonly TemaModel: Model<Tema>,
  ) {}

  private populateFields(): any[] {
    return [{ path: '' }];
  }

  async post(InformeDTO: InformeDTO): Promise<Informe> {
    const fecha = new Date();
    const informeData = {
      ...InformeDTO,
      activo: true,
      fecha_creacion: fecha,
    };
    return await this.InformeModel.create(informeData);
  }

  async getAll(filterDto: FilterDto): Promise<Informe[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return await this.InformeModel.find(
      filtersService.getQuery(),
      filtersService.getFields(),
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .exec();
  }

  async getById(id: string): Promise<Informe> {
    const informe = await this.InformeModel.findById(id).exec();
    if (!informe) {
      throw new Error(`${id} no existe`);
    }
    return informe;
  }

  async put(id: string, InformeDTO: InformeDTO): Promise<Informe> {
    if (InformeDTO.fecha_creacion) {
      delete InformeDTO.fecha_creacion;
    }
    const update = await this.InformeModel.findByIdAndUpdate(id, InformeDTO, {
      new: true,
    }).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<Informe> {
    const deleted = await this.InformeModel.findByIdAndUpdate(
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
    return await this.InformeModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }

  async getHallazgosByInforme(informeId: string): Promise<any[]> {
    const informe = await this.InformeModel.findById(informeId).exec();
    if (!informe) {
      throw new Error(`Informe ${informeId} no existe`);
    }

    const temas = await this.TemaModel.find({
      informe_id: informeId,
      activo: true,
    }).exec();

    const hallazgos = [];

    temas.forEach((tema) => {
      tema.subtema.forEach((subtema) => {
        if (subtema.activo) {
          subtema.hallazgo.forEach((hallazgo) => {
            if (hallazgo.activo) {
              hallazgos.push({
                _id: hallazgo._id,
                titulo: hallazgo.titulo,
                criterio: hallazgo.criterio,
                descripcion: hallazgo.descripcion,
                activo: hallazgo.activo,
                tema_id: tema._id,
                tema_titulo: tema.titulo,
                subtema_id: subtema._id,
                subtema_titulo: subtema.titulo,
                informe_id: informeId,
                createdAt: hallazgo.createdAt,
                updatedAt: hallazgo.updatedAt,
              });
            }
          });
        }
      });
    });

    return hallazgos;
  }
}
