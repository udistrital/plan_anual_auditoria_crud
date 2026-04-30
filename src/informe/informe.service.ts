import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Informe } from './schemas/informe.schema';
import { InformeDTO } from './dto/informe.dto';
import { Tema } from '../tema/schemas/tema.schema';
import { Hallazgo } from '../hallazgo/schemas/hallazgo.schema';

@Injectable()
export class InformeService {
  constructor(
    @InjectModel(Informe.name)
    private readonly InformeModel: Model<Informe>,
    @InjectModel(Tema.name)
    private readonly TemaModel: Model<Tema>,
    @InjectModel(Hallazgo.name)
    private readonly HallazgoModel: Model<Hallazgo>,
  ) {}

  private populateFields(): any[] {
    return [{ path: '' }];
  }

  async post(InformeDTO: InformeDTO): Promise<Informe> {
    const fecha = new Date();
    const informeData: InformeDTO = {
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

    const [temas, hallazgos] = await Promise.all([
      this.TemaModel.find({ informe_id: new Types.ObjectId(informeId), activo: true }).lean().exec(),
      this.HallazgoModel.find({ informe_id: new Types.ObjectId(informeId), activo: true }).lean().exec(),
    ]);

    // Mapa subtema_id → { tema, subtema } para enriquecer cada hallazgo con contexto
    const subtemaMap = new Map<string, { tema: any; subtema: any }>();
    for (const tema of temas) {
      for (const subtema of (tema.subtema || [])) {
        if (subtema.activo) {
          subtemaMap.set(subtema._id.toString(), { tema, subtema });
        }
      }
    }

    return hallazgos.map((hallazgo: any) => {
      const ctx = subtemaMap.get(hallazgo.subtema_id?.toString());
      return {
        _id: hallazgo._id,
        titulo: hallazgo.titulo,
        criterio: hallazgo.criterio,
        descripcion: hallazgo.descripcion,
        rechazado: hallazgo.rechazado,
        activo: hallazgo.activo,
        informe_id: informeId,
        subtema_id: hallazgo.subtema_id,
        subtema_titulo: ctx?.subtema?.titulo ?? null,
        tema_id: ctx?.tema?._id ?? null,
        tema_titulo: ctx?.tema?.titulo ?? null,
        createdAt: hallazgo.createdAt,
        updatedAt: hallazgo.updatedAt,
      };
    });
  }
}
