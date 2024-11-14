import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service'
import { Documento } from './schemas/documento.schema'
import { DocumentoDTO } from './dto/documento.dto'
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';

@Injectable()
export class DocumentoService {
    private referenciaTipo: {Nombre: string }[] = [
        {  Nombre: "Plan Auditoria" },
        {  Nombre: "Auditoria" },
    ];

    constructor(
        @InjectModel(Documento.name)
        private readonly DocumentoModel: Model<Documento>,
        @InjectModel(PlanAuditoria.name)
        private readonly PlanAuditoriaModel: Model<PlanAuditoria>,
        @InjectModel(Auditoria.name)
        private readonly AuditoriaModel: Model<Auditoria>
    ) { }
    
    private populateFields(): any[] {
        return [{ path: '' }];
    }

    private async checkRelated(DocumentoDTO: DocumentoDTO) {
        const referenciaValida = this.referenciaTipo.find(
            (tipo) => tipo.Nombre === DocumentoDTO.referencia_tipo
        );
    
        if (!referenciaValida) {
            throw new Error(`Tipo de referencia con id ${DocumentoDTO.referencia_tipo} no es válido`);
        }

        if (DocumentoDTO.referencia_id) {
            let actividad;
            if (DocumentoDTO.referencia_tipo === 'Plan Auditoria') { 
                actividad = await this.PlanAuditoriaModel
                    .findById(DocumentoDTO.referencia_id)
                    .exec();
            } else if (DocumentoDTO.referencia_tipo === 'Auditoria') { 
                actividad = await this.AuditoriaModel
                    .findById(DocumentoDTO.referencia_id)
                    .exec();
            }
            if (!actividad) {
                throw new Error(
                    `Documento relacionado con id ${DocumentoDTO.referencia_id} no existe en ${referenciaValida.Nombre}`,
                );
            }
        }
    }

    async post(DocumentoDTO: DocumentoDTO): Promise<Documento> {
        const fecha = new Date();
        const actividadData = {
            ...DocumentoDTO,
            activo: true,
            fechaCreacion: fecha,
        };
        await this.checkRelated(DocumentoDTO);
        return await this.DocumentoModel.create(actividadData);
    }

    async getAll(filterDto: FilterDto): Promise<Documento[]> {
        const filtersService = new FiltersService(filterDto);
        let populateFields = [];
        if (filtersService.isPopulated()) {
            populateFields = this.populateFields();
        }
        return await this.DocumentoModel
            .find(
                filtersService.getQuery(),
                filtersService.getFields(),
                filtersService.getLimitAndOffset(),
            )
            .sort(filtersService.getSortBy())
            .populate(populateFields)
            .exec();
    }

    async getById(id: string): Promise<Documento> {
        const planAuditoria = await this.DocumentoModel.findById(id).exec();
        if (!planAuditoria) {
            throw new Error(`${id} no existe`);
        }
        return planAuditoria;
    }

    async put(id: string, DocumentoDTO: DocumentoDTO): Promise<Documento> {
        if (DocumentoDTO.fecha_creacion) {
            delete DocumentoDTO.fecha_creacion;
        }
        await this.checkRelated(DocumentoDTO);
        const update = await this.DocumentoModel
            .findByIdAndUpdate(id, DocumentoDTO, { new: true })
            .exec();
        if (!update) {
            throw new Error(`${id} no existe`);
        }
        return update;
    }

    async delete(id: string): Promise<Documento> {
        const deleted = await this.DocumentoModel
            .findByIdAndUpdate(id, { activo: false }, { new: true })
            .exec();
        if (!deleted) {
            throw new Error(`${id} no existe`);
        }
        return deleted;
    }

    async count(filterDto: FilterDto): Promise<number> {
        const filtersService = new FiltersService(filterDto);

        return await this.DocumentoModel
            .countDocuments(filtersService.getQuery())
            .exec();
    }
}
