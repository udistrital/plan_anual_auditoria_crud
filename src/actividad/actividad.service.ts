import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import {FiltersService } from '../filters/filters.service'
import {Actividad} from './schemas/actividad.schema'
import {ActividadDTO} from './dto/actividad.dto'
import { Auditoria } from 'src/auditoria/schemas/auditoria.schema';
@Injectable()
export class ActividadService {
    constructor(
        @InjectModel(Actividad.name)
        private readonly ActividadModel: Model<Actividad>,
        @InjectModel(Auditoria.name)
        private readonly PlanAuditoriaModel: Model<Auditoria>
    ){}
    private populateFields(): any[] {
        return [{ path: 'Actividad_id' }];
      }
      private async checkRelated(ActividadDTO: ActividadDTO) {
        if (ActividadDTO.auditoria_id) {
          const actividad = await this.PlanAuditoriaModel
            .findById(ActividadDTO.auditoria_id)
            .exec();
          if (!actividad) {
            throw new Error(
              `actividad con id ${ActividadDTO.auditoria_id} no existe`,
            );
          }
        }
      }
    async post(ActividadDTO: ActividadDTO): Promise<Actividad> {
        const fecha = new Date();
        const planAuditoriaData = {
        ...ActividadDTO,
        fecha_creacion: fecha,
        fecha_modificacion: fecha,
        };
        await this.checkRelated(ActividadDTO);
        return await this.ActividadModel.create(planAuditoriaData);
    }
    async getAll(filterDto: FilterDto): Promise<Actividad[]> {
        const filtersService = new FiltersService(filterDto);
        let populateFields = [];
        if (filtersService.isPopulated()) {
          populateFields = this.populateFields();
        }
        return await this.ActividadModel
          .find(
            filtersService.getQuery(),
            filtersService.getFields(),
            filtersService.getLimitAndOffset(),
          )
          .sort(filtersService.getSortBy())
          .populate(populateFields)
          .exec();
      }
    
      async getById(id: string): Promise<Actividad> {
        const planAuditoria = await this.ActividadModel.findById(id).exec();
        if (!planAuditoria) {
          throw new Error(`${id} doesn't exist`);
        }
        return planAuditoria;
      }
    
      async put(id: string, ActividadDTO: ActividadDTO): Promise<Actividad> {
        ActividadDTO.fecha_modificacion = new Date();
        if (ActividadDTO.fecha_creacion) {
          delete ActividadDTO.fecha_creacion;
        }
        await this.checkRelated(ActividadDTO);
        const update = await this.ActividadModel
          .findByIdAndUpdate(id, ActividadDTO, { new: true })
          .exec();
        if (!update) {
          throw new Error(`${id} doesn't exist`);
        }
        return update;
      }
    
      async delete(id: string): Promise<Actividad> {
        const deleted = await this.ActividadModel
          .findByIdAndUpdate(id, { activo: false }, { new: true })
          .exec();
        if (!deleted) {
          throw new Error(`${id} doesn't exist`);
        }
        return deleted;
      }

}
