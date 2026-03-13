import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { AuditoriaPadreEstado } from './schema/auditoria-padre-estado.schema';
import { AuditoriaPadreEstadoDto } from './dto/auditoria-padre-estado.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';

@Injectable()
export class EstadoAuditoriaPadreService {
  constructor(
    @InjectModel(AuditoriaPadreEstado.name)
    private readonly AuditoriaPadreEstadoModel: Model<AuditoriaPadreEstado>,
    @InjectModel(AuditoriaPadre.name)
    private readonly AuditoriaPadreModel: Model<AuditoriaPadre>,
  ) {}

  private populateFields(): any[] {
    return [{ path: 'auditoria_padre_id' }];
  }

  private async checkRelated(auditoriaPadreEstadoDto: AuditoriaPadreEstadoDto) {
    if (auditoriaPadreEstadoDto.auditoria_padre_id) {
      const auditoriaPadre = await this.AuditoriaPadreModel.findById(
        auditoriaPadreEstadoDto.auditoria_padre_id,
      ).exec();
      if (!auditoriaPadre) {
        throw new Error(
          `Auditoria padre relacionada con id ${auditoriaPadreEstadoDto.auditoria_padre_id} no existe`,
        );
      }
    }
  }

  async post(auditoriaPadreEstadoDto: AuditoriaPadreEstadoDto): Promise<AuditoriaPadreEstado> {
    const fecha = new Date();
    const estadoData = {
      ...auditoriaPadreEstadoDto,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };

    const estadosRelacionados = await this.AuditoriaPadreEstadoModel.find({
      auditoria_padre_id: auditoriaPadreEstadoDto.auditoria_padre_id,
      actual: true,
    });

    if (estadosRelacionados.length > 0) {
      await this.AuditoriaPadreEstadoModel.updateMany(
        {
          auditoria_padre_id: auditoriaPadreEstadoDto.auditoria_padre_id,
          actual: true,
        },
        { $set: { actual: false } },
      );
    }

    const estadoCreado = await this.AuditoriaPadreEstadoModel.create(estadoData);
    const datosActualizarEstado = {
      estado_id: estadoCreado.estado_id,
    };
    await this.AuditoriaPadreModel.findByIdAndUpdate(estadoCreado.auditoria_padre_id, datosActualizarEstado, { new: true }).exec();
    return estadoCreado;
  }

  async getAll(filterDto: FilterDto): Promise<AuditoriaPadreEstado[]> {
    const filtersService = new FiltersService(filterDto);
    let populateFields = [];
    if (filtersService.isPopulated()) {
      populateFields = this.populateFields();
    }
    return (await this.AuditoriaPadreEstadoModel.find(
      filtersService.getQuery(),
      filtersService.getFields() as any,
      filtersService.getLimitAndOffset(),
    )
      .sort(filtersService.getSortBy())
      .populate(populateFields)
      .lean()
      .exec()) as unknown as AuditoriaPadreEstado[];
  }

  async getById(id: string): Promise<AuditoriaPadreEstado> {
    const estado = await this.AuditoriaPadreEstadoModel.findById(id).exec();
    if (!estado) {
      throw new Error(`${id} no existe`);
    }
    return estado;
  }

  async put(
    id: string,
    auditoriaPadreEstadoDto: AuditoriaPadreEstadoDto,
  ): Promise<AuditoriaPadreEstado> {
    await this.checkRelated(auditoriaPadreEstadoDto);
    const update = await this.AuditoriaPadreEstadoModel.findByIdAndUpdate(
      id,
      auditoriaPadreEstadoDto,
      { new: true },
    ).exec();
    if (!update) {
      throw new Error(`${id} no existe`);
    }
    return update;
  }

  async delete(id: string): Promise<AuditoriaPadreEstado> {
    const deleted = await this.AuditoriaPadreEstadoModel.findByIdAndUpdate(
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
    return await this.AuditoriaPadreEstadoModel.countDocuments(
      filtersService.getQuery(),
    ).exec();
  }
}
