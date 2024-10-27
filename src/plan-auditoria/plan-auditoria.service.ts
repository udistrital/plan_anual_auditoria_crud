import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import {FiltersService } from '../filters/filters.service'
import {PlanAuditoria} from './schemas/plan-auditoria.schema'
import {PlanAuditoriaDTO} from './dto/plan-auditoria.dto'

@Injectable()
export class PlanAuditoriaService {
    constructor(
        @InjectModel(PlanAuditoria.name)
        private readonly planAuditoriaModel: Model<PlanAuditoria>,
    ){}
    private populateFields(): any[] {
        return [{ path: 'planAuditoria_id' }];
      }

    async post(planAuditoriaDto: PlanAuditoriaDTO): Promise<PlanAuditoria> {
        const fecha = new Date();
        const planAuditoriaData = {
        ...planAuditoriaDto,
        fecha_creacion: fecha,
        fecha_modificacion: fecha,
        };
        return await this.planAuditoriaModel.create(planAuditoriaData);
    }
    async getAll(filterDto: FilterDto): Promise<PlanAuditoria[]> {
        const filtersService = new FiltersService(filterDto);
        let populateFields = [];
        if (filtersService.isPopulated()) {
          populateFields = this.populateFields();
        }
        return await this.planAuditoriaModel
          .find(
            filtersService.getQuery(),
            filtersService.getFields(),
            filtersService.getLimitAndOffset(),
          )
          .sort(filtersService.getSortBy())
          .populate(populateFields)
          .exec();
      }
    
      async getById(id: string): Promise<PlanAuditoria> {
        const planAuditoria = await this.planAuditoriaModel.findById(id).exec();
        if (!planAuditoria) {
          throw new Error(`${id} doesn't exist`);
        }
        return planAuditoria;
      }
    
      async put(id: string, planAuditoriaDto: PlanAuditoriaDTO): Promise<PlanAuditoria> {
        planAuditoriaDto.fecha_modificacion = new Date();
        if (planAuditoriaDto.fecha_creacion) {
          delete planAuditoriaDto.fecha_creacion;
        }
        const update = await this.planAuditoriaModel
          .findByIdAndUpdate(id, planAuditoriaDto, { new: true })
          .exec();
        if (!update) {
          throw new Error(`${id} doesn't exist`);
        }
        return update;
      }
    
      async delete(id: string): Promise<PlanAuditoria> {
        const deleted = await this.planAuditoriaModel
          .findByIdAndUpdate(id, { activo: false }, { new: true })
          .exec();
        if (!deleted) {
          throw new Error(`${id} doesn't exist`);
        }
        return deleted;
      }

}
