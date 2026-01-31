import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { InformeEstado } from './schemas/informe-estado.schema';
import { InformeEstadoDto } from './dto/informe-estado.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Informe } from '../informe/schemas/informe.schema';

@Injectable()
export class InformeEstadoService {
  constructor(
    @InjectModel(InformeEstado.name)
    private readonly InformeEstadoModel: Model<InformeEstado>,
    @InjectModel(Informe.name)
    private readonly InformeModel: Model<Informe>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'informe_id' }];
  }

  private async checkRelated(informeEstadoDto: InformeEstadoDto) {
    if (informeEstadoDto.informe_id) {
      const informe = await this.InformeModel.findById(
        informeEstadoDto.informe_id,
      ).exec();
      if (!informe) {
        throw new Error(
          `Informe relacionado con id ${informeEstadoDto.informe_id} no existe`,
        );
      }
    }
  }

  async post(informeEstadoDto: InformeEstadoDto): Promise<InformeEstado> {
  await this.checkRelated(informeEstadoDto);
  
  const fecha = new Date();
  const informeEstadoData = {
    ...informeEstadoDto,
    actual: true,
    activo: true,
    fecha_ejecucion_estado: fecha,
  };

  const estadosRelacionados = await this.InformeEstadoModel.find({
    informe_id: informeEstadoDto.informe_id,
    actual: true,
  });

  if (estadosRelacionados.length > 0) {
    await this.InformeEstadoModel.updateMany(
      {
        informe_id: informeEstadoDto.informe_id,
        actual: true,
      },
      { $set: { actual: false } },
    );
  }

  return await this.InformeEstadoModel.create(informeEstadoData);
}

  async getAll(filterDto: FilterDto): Promise<InformeEstado[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return await this.InformeEstadoModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec() as unknown as InformeEstado[];
  }

  async getById(id: string): Promise<InformeEstado> {
    const informeEstado = await this.InformeEstadoModel.findById(id).exec();
    if (!informeEstado) {
      throw new Error(`${id} no existe`);
    }
    return informeEstado;
  }

  async put(
    id: string,
    informeEstadoDto: InformeEstadoDto,
  ): Promise<InformeEstado> {
    await this.checkRelated(informeEstadoDto);
    const update = await this.InformeEstadoModel.findByIdAndUpdate(
      id,
      informeEstadoDto,
      { new: true },
    ).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<InformeEstado> {
    const deleted = await this.InformeEstadoModel.findByIdAndUpdate(
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

    return await this.InformeEstadoModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }
}