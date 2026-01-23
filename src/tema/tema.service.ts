import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDto } from '../filters/filters.dto';
import { FiltersService } from '../filters/filters.service';
import { Tema } from './schemas/tema.schema';
import { TemaDTO } from './dto/tema.dto';
import { SubtemaDTO } from './dto/subtema.dto';
import { HallazgoDTO } from './dto/hallazgo.dto';

@Injectable()
export class TemaService {
    constructor(
        @InjectModel(Tema.name)
        private readonly TemaModel: Model<Tema>,
    ) { }
    
    private populateFields(): any[] {
        return [{ path: '' }];
    }

    async post(TemaDTO: TemaDTO): Promise<Tema> {
        const fecha = new Date();
        const temaData = {
            ...TemaDTO,
            activo: true,
            fecha_creacion: fecha,
        };
        return await this.TemaModel.create(temaData);
    }

    async getAll(filterDto: FilterDto): Promise<Tema[]> {
        const filtersService = new FiltersService(filterDto);
        let populateFields = [];
        if (filtersService.isPopulated()) {
            populateFields = this.populateFields();
        }
        return await this.TemaModel
            .find(
                filtersService.getQuery(),
                filtersService.getFields(),
                filtersService.getLimitAndOffset(),
            )
            .sort(filtersService.getSortBy())
            .populate(populateFields)
            .exec();
    }

    async getById(id: string): Promise<Tema> {
        const tema = await this.TemaModel.findById(id).exec();
        if (!tema) {
            throw new Error(`${id} no existe`);
        }
        return tema;
    }

    async put(id: string, TemaDTO: TemaDTO): Promise<Tema> {
        if (TemaDTO.fecha_creacion) {
            delete TemaDTO.fecha_creacion;
        }
        const update = await this.TemaModel
            .findByIdAndUpdate(id, TemaDTO, { new: true })
            .exec();
        if (!update) {
            throw new Error(`${id} no existe`);
        }
        return update;
    }

    async delete(id: string): Promise<Tema> {
        const deleted = await this.TemaModel
            .findByIdAndUpdate(id, { activo: false }, { new: true })
            .exec();
        if (!deleted) {
            throw new Error(`${id} no existe`);
        }
        return deleted;
    }

    async count(filterDto: FilterDto): Promise<number> {
        const filtersService = new FiltersService(filterDto);
        return await this.TemaModel
            .countDocuments(filtersService.getQuery())
            .exec();
    }

    async agregarSubtema(temaId: string, SubtemaDTO: SubtemaDTO): Promise<Tema> {
        const tema = await this.TemaModel.findById(temaId).exec();
        if (!tema) {
            throw new Error(`${temaId} no existe`);
        }

        tema.subtema.push({
            ...SubtemaDTO,
            activo: true,
            hallazgo: []
        });
        return await tema.save();
    }

    async actualizarSubtema(temaId: string, subtemaId: string, SubtemaDTO: SubtemaDTO): Promise<Tema> {
        const tema = await this.TemaModel.findById(temaId).exec();
        if (!tema) {
            throw new Error(`${temaId} no existe`);
        }

        const subtema = tema.subtema.id(subtemaId);
        if (!subtema) {
            throw new Error(`Subtema ${subtemaId} no existe`);
        }

        subtema.titulo = SubtemaDTO.titulo;
        if (SubtemaDTO.activo !== undefined) {
            subtema.activo = SubtemaDTO.activo;
        }
        
        return await tema.save();
    }

    async eliminarSubtema(temaId: string, subtemaId: string): Promise<Tema> {
        const tema = await this.TemaModel.findById(temaId).exec();
        if (!tema) {
            throw new Error(`${temaId} no existe`);
        }

        const subtema = tema.subtema.id(subtemaId);
        if (!subtema) {
            throw new Error(`Subtema ${subtemaId} no existe`);
        }

        subtema.activo = false;
        return await tema.save();
    }

    async agregarHallazgo(temaId: string, subtemaId: string, HallazgoDTO: HallazgoDTO): Promise<Tema> {
        const tema = await this.TemaModel.findById(temaId).exec();
        if (!tema) {
            throw new Error(`${temaId} no existe`);
        }

        const subtema = tema.subtema.id(subtemaId);
        if (!subtema) {
            throw new Error(`Subtema ${subtemaId} no existe`);
        }

        subtema.hallazgo.push({
            ...HallazgoDTO,
            activo: true
        });
        return await tema.save();
    }

    async actualizarHallazgo(
        temaId: string,
        subtemaId: string,
        hallazgoId: string,
        HallazgoDTO: HallazgoDTO
    ): Promise<Tema> {
        const tema = await this.TemaModel.findById(temaId).exec();
        if (!tema) {
            throw new Error(`${temaId} no existe`);
        }

        const subtema = tema.subtema.id(subtemaId);
        if (!subtema) {
            throw new Error(`Subtema ${subtemaId} no existe`);
        }

        const hallazgo = subtema.hallazgo.id(hallazgoId);
        if (!hallazgo) {
            throw new Error(`Hallazgo ${hallazgoId} no existe`);
        }

        hallazgo.titulo = HallazgoDTO.titulo;
        hallazgo.criterio = HallazgoDTO.criterio;
        hallazgo.descripcion = HallazgoDTO.descripcion;
        if (HallazgoDTO.activo !== undefined) {
            hallazgo.activo = HallazgoDTO.activo;
        }

        return await tema.save();
    }

    async eliminarHallazgo(temaId: string, subtemaId: string, hallazgoId: string): Promise<Tema> {
        const tema = await this.TemaModel.findById(temaId).exec();
        if (!tema) {
            throw new Error(`${temaId} no existe`);
        }

        const subtema = tema.subtema.id(subtemaId);
        if (!subtema) {
            throw new Error(`Subtema ${subtemaId} no existe`);
        }

        const hallazgo = subtema.hallazgo.id(hallazgoId);
        if (!hallazgo) {
            throw new Error(`Hallazgo ${hallazgoId} no existe`);
        }

        hallazgo.activo = false;
        return await tema.save();
    }
}