import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { AuditoriaDTO } from 'src/auditoria/dto/auditoria.dto';
import { AuditoriaEstado } from '../auditoria-estado/schema/auditoria-estado.schema';
import { AuditoriaEstadoDto } from 'src/auditoria-estado/dto/auditoria-estado.dto';
import { CreateAuditoriaGestion } from './dto/create-auditoria-gestion.dto';

@Injectable()
export class AuditoriaGestionService {

  constructor(
    @InjectModel(Auditoria.name)
    private readonly AuditoriaModel: Model<Auditoria>,
    @InjectModel(AuditoriaEstado.name)
    private readonly AuditoriaEstadoModel: Model<AuditoriaEstado>,
  ) { }

  async post(createAuditoriaGestionDto: CreateAuditoriaGestion) {
    const fecha = new Date();
    let auditoria: AuditoriaDTO;
    let estado: AuditoriaEstadoDto;
    ({ ...auditoria } = createAuditoriaGestionDto);
    ({ ...estado } = createAuditoriaGestionDto);
    const auditoriaData: AuditoriaDTO = {
      ...auditoria,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    const nuevaAuditoria = await this.AuditoriaModel.create(auditoriaData);

    const auditoriaEstadoData: AuditoriaEstadoDto = {
      ...estado,
      auditoria_id: nuevaAuditoria._id,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };
    return await this.AuditoriaEstadoModel.create(auditoriaEstadoData);
  }

  async put(id: string, auditoriaNuevoEstado: AuditoriaEstadoDto) {
    const fecha = new Date();
    const auditoriasEnPlan = await this.AuditoriaModel.find({ plan_auditoria_id: id, activo: true });

    const estadosAnteriores = await this.AuditoriaEstadoModel.find({
      auditoria_id: { $in: auditoriasEnPlan.map(a => a._id) },
      actual: true,
    });

    if (estadosAnteriores.length > 0) {
      await this.AuditoriaEstadoModel.updateMany(
        {
          auditoria_id: { $in: auditoriasEnPlan.map(a => a._id) },
          actual: true,
        },
        { $set: { actual: false } },
      );
    }

    const nuevosEstados = auditoriasEnPlan.map(auditoria => ({
      auditoria_id: auditoria._id,
      usuario_id: auditoriaNuevoEstado.usuario_id,
      usuario_rol: auditoriaNuevoEstado.usuario_rol,
      observacion: auditoriaNuevoEstado.observacion,
      estado_id: auditoriaNuevoEstado.estado_id,
      fase_id: auditoriaNuevoEstado.fase_id,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    }));

    return await this.AuditoriaEstadoModel.insertMany(nuevosEstados);
  }

}
