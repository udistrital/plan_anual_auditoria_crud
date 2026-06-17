import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { AccionMejoraEstado } from './schema/accion-mejora-estado.schema';
import { AccionMejoraEstadoDto } from './dto/accion-mejora-estado.dto';
import { AccionMejora } from '../accion-mejora/schema/accion-mejora.schema';

@Injectable()
export class AccionMejoraEstadoService {
  constructor(
    @InjectModel(AccionMejoraEstado.name)
    private readonly accionMejoraEstadoModel: Model<AccionMejoraEstado>,
    @InjectModel(AccionMejora.name)
    private readonly accionMejoraModel: Model<AccionMejora>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'accion_mejora_id' }];
  }

  private async checkRelated(dto: AccionMejoraEstadoDto) {
    if (dto.accion_mejora_id) {
      const accion = await this.accionMejoraModel
        .findById(dto.accion_mejora_id)
        .exec();
      if (!accion) {
        throw new Error(
          `Acción de mejora relacionada con id ${dto.accion_mejora_id} no existe`,
        );
      }
    }
  }

  async post(dto: AccionMejoraEstadoDto): Promise<AccionMejoraEstado> {
    const fecha = new Date();
    const data: AccionMejoraEstadoDto = {
      ...dto,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };

    const estadosRelacionados = await this.accionMejoraEstadoModel.find({
      accion_mejora_id: dto.accion_mejora_id,
      actual: true,
    });

    if (estadosRelacionados.length > 0) {
      await this.accionMejoraEstadoModel.updateMany(
        { accion_mejora_id: dto.accion_mejora_id, actual: true },
        { $set: { actual: false } },
      );
    }

    const estadoCreado = await this.accionMejoraEstadoModel.create(data);

    // Denormaliza el estado vigente en la propia acción de mejora
    await this.accionMejoraModel
      .findByIdAndUpdate(
        estadoCreado.accion_mejora_id,
        { estado_id: estadoCreado.estado_id, fecha_modificacion: fecha },
        { new: true },
      )
      .exec();

    return estadoCreado;
  }

  async getAll(filterDto: FilterDto): Promise<AccionMejoraEstado[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.accionMejoraEstadoModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as AccionMejoraEstado[];
  }

  async getById(id: string): Promise<AccionMejoraEstado> {
    const estado = await this.accionMejoraEstadoModel.findById(id).exec();
    if (!estado) {
      throw new Error(`${id} no existe`);
    }
    return estado;
  }

  async put(
    id: string,
    dto: AccionMejoraEstadoDto,
  ): Promise<AccionMejoraEstado> {
    await this.checkRelated(dto);
    const update = await this.accionMejoraEstadoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<AccionMejoraEstado> {
    const deleted = await this.accionMejoraEstadoModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.accionMejoraEstadoModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
