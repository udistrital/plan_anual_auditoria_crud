import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { AuditoriaExterna } from '../auditoria-externa/schema/auditoria-externa.schema';
import { AuditoriaExternaHallazgo } from './schema/auditoria-externa-hallazgo.schema';
import {
  AuditoriaExternaHallazgoDto,
  AuditoriaExternaHallazgoLoteDto,
} from './dto/auditoria-externa-hallazgo.dto';

/** Tope técnico de un lote (el mismo del cargue masivo). */
export const MAXIMO_HALLAZGOS_LOTE = 500;

@Injectable()
export class AuditoriaExternaHallazgoService {
  constructor(
    @InjectModel(AuditoriaExternaHallazgo.name)
    private readonly hallazgoModel: Model<AuditoriaExternaHallazgo>,
    @InjectModel(AuditoriaExterna.name)
    private readonly auditoriaExternaModel: Model<AuditoriaExterna>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'auditoria_externa_id' }];
  }

  private async checkRelated(auditoriaExternaId: unknown) {
    if (auditoriaExternaId) {
      const auditoria = await this.auditoriaExternaModel
        .findById(auditoriaExternaId)
        .exec();
      if (!auditoria) {
        throw new Error(
          `Auditoría externa relacionada con id ${String(auditoriaExternaId)} no existe`,
        );
      }
    }
  }

  async post(
    dto: AuditoriaExternaHallazgoDto,
  ): Promise<AuditoriaExternaHallazgo> {
    await this.checkRelated(dto.auditoria_externa_id);
    const fecha = new Date();
    return await this.hallazgoModel.create({
      ...dto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    });
  }

  /**
   * Crea varios hallazgos de una misma auditoría en una sola llamada. Si uno falla (por ejemplo,
   * un número repetido), lanza el error y pueden quedar creados los anteriores: quien invoca
   * compensa con borrado lógico de los hallazgos de la auditoría.
   */
  async postLote(
    dto: AuditoriaExternaHallazgoLoteDto,
  ): Promise<AuditoriaExternaHallazgo[]> {
    if (!Array.isArray(dto.hallazgos) || dto.hallazgos.length === 0) {
      throw new Error('El lote debe incluir al menos un hallazgo');
    }
    if (dto.hallazgos.length > MAXIMO_HALLAZGOS_LOTE) {
      throw new Error(
        `El lote supera el máximo de ${MAXIMO_HALLAZGOS_LOTE} hallazgos`,
      );
    }
    await this.checkRelated(dto.auditoria_externa_id);
    const fecha = new Date();
    const documentos = dto.hallazgos.map((hallazgo) => ({
      ...hallazgo,
      auditoria_externa_id: dto.auditoria_externa_id,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    }));
    return (await this.hallazgoModel.insertMany(documentos, {
      ordered: true,
    })) as unknown as AuditoriaExternaHallazgo[];
  }

  async getAll(filterDto: FilterDto): Promise<AuditoriaExternaHallazgo[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.hallazgoModel
      .find(
        filtersService.getQuery(),
        filtersService.getFields() as any,
        filtersService.getLimitAndOffset(),
      )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as AuditoriaExternaHallazgo[];
  }

  async getById(id: string): Promise<AuditoriaExternaHallazgo> {
    const hallazgo = await this.hallazgoModel.findById(id).exec();
    if (!hallazgo) {
      throw new Error(`${id} no existe`);
    }
    return hallazgo;
  }

  async put(
    id: string,
    dto: AuditoriaExternaHallazgoDto,
  ): Promise<AuditoriaExternaHallazgo> {
    dto.fecha_modificacion = new Date();
    if (dto.fecha_creacion) {
      delete dto.fecha_creacion;
    }
    await this.checkRelated(dto.auditoria_externa_id);
    const update = await this.hallazgoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<AuditoriaExternaHallazgo> {
    const deleted = await this.hallazgoModel
      .findByIdAndUpdate(
        id,
        { activo: false, fecha_modificacion: new Date() },
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
    return await this.hallazgoModel
      .countDocuments(filtersService.getQuery())
      .exec();
  }
}
