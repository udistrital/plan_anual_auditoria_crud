import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { AuditoriaExterna } from '../auditoria-externa/schema/auditoria-externa.schema';
import { AuditoriaExternaEstado } from './schema/auditoria-externa-estado.schema';
import { AuditoriaExternaEstadoDto } from './dto/auditoria-externa-estado.dto';

@Injectable()
export class AuditoriaExternaEstadoService {
  constructor(
    @InjectModel(AuditoriaExternaEstado.name)
    private readonly estadoModel: Model<AuditoriaExternaEstado>,
    @InjectModel(AuditoriaExterna.name)
    private readonly auditoriaExternaModel: Model<AuditoriaExterna>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'auditoria_externa_id' }];
  }

  private async checkRelated(dto: AuditoriaExternaEstadoDto) {
    if (dto.auditoria_externa_id) {
      const auditoria = await this.auditoriaExternaModel
        .findById(dto.auditoria_externa_id)
        .exec();
      if (!auditoria) {
        throw new Error(
          `Auditoría externa relacionada con id ${dto.auditoria_externa_id} no existe`,
        );
      }
    }
  }

  /** Crea el estado como vigente, deja los anteriores como históricos y copia `estado_id` a la auditoría. */
  async post(dto: AuditoriaExternaEstadoDto): Promise<AuditoriaExternaEstado> {
    await this.checkRelated(dto);
    await this.estadoModel.updateMany(
      { auditoria_externa_id: dto.auditoria_externa_id, actual: true },
      { $set: { actual: false } },
    );
    const creado = await this.estadoModel.create({
      ...dto,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: new Date(),
    });
    await this.auditoriaExternaModel
      .findByIdAndUpdate(
        creado.auditoria_externa_id,
        { estado_id: creado.estado_id, fecha_modificacion: new Date() },
        { new: true },
      )
      .exec();
    return creado;
  }

  async getAll(filterDto: FilterDto): Promise<AuditoriaExternaEstado[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.estadoModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as AuditoriaExternaEstado[];
  }

  async getById(id: string): Promise<AuditoriaExternaEstado> {
    const estado = await this.estadoModel.findById(id).exec();
    if (!estado) {
      throw new Error(`${id} no existe`);
    }
    return estado;
  }

  async put(
    id: string,
    dto: AuditoriaExternaEstadoDto,
  ): Promise<AuditoriaExternaEstado> {
    await this.checkRelated(dto);
    const update = await this.estadoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<AuditoriaExternaEstado> {
    const deleted = await this.estadoModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
    if (!deleted) {
      throw new Error(`${id} no existe`);
    }
    return deleted;
  }

  async count(filterDto: FilterDto): Promise<number> {
    const filtersService = new FiltersService(filterDto);
    return await this.estadoModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
