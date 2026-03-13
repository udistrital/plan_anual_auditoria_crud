import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';
import { AuditoriaPadreDTO } from 'src/auditoria-padre/dto/auditoria-padre.dto';
import { AuditoriaPadreEstado } from '../auditoria-padre-estado/schema/auditoria-padre-estado.schema';
import { AuditoriaPadreEstadoDto } from 'src/auditoria-padre-estado/dto/auditoria-padre-estado.dto';
import { CreateAuditoriaGestion } from './dto/create-auditoria-gestion.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';

@Injectable()
export class AuditoriaGestionService {
  constructor(
    @InjectModel(AuditoriaPadre.name)
    private readonly AuditoriaPadreModel: Model<AuditoriaPadre>,
    @InjectModel(AuditoriaPadreEstado.name)
    private readonly AuditoriaPadreEstadoModel: Model<AuditoriaPadreEstado>,
    @InjectModel(PlanAuditoria.name)
    private readonly PlanAuditoriaModel: Model<PlanAuditoria>,
  ) {}

  async post(createAuditoriaGestionDto: CreateAuditoriaGestion) {
    const fecha = new Date();
    const auditoriaPadre = { ...createAuditoriaGestionDto } as AuditoriaPadreDTO;
    const auditoriaPadreData = {
      ...auditoriaPadre,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    };
    const nuevaAuditoriaPadre = await this.AuditoriaPadreModel.create(auditoriaPadreData);

    const auditoriaPadreEstadoData: Partial<AuditoriaPadreEstadoDto> = {
      auditoria_padre_id: nuevaAuditoriaPadre._id.toString(),
      usuario_id: createAuditoriaGestionDto.usuario_id,
      usuario_rol: createAuditoriaGestionDto.usuario_rol,
      observacion: createAuditoriaGestionDto.observacion,
      estado_id: createAuditoriaGestionDto.estado_id,
      fase_id: createAuditoriaGestionDto.fase_id,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };
    const nuevoEstado = await this.AuditoriaPadreEstadoModel.create(auditoriaPadreEstadoData);

    if (createAuditoriaGestionDto.plan_auditoria_id) {
      const planActualizado = await this.PlanAuditoriaModel.findByIdAndUpdate(
        createAuditoriaGestionDto.plan_auditoria_id,
        { $push: { auditorias: nuevaAuditoriaPadre._id.toString() } },
        { new: true },
      );

      if (!planActualizado) {
        throw new Error(`Plan de auditoría con ID ${createAuditoriaGestionDto.plan_auditoria_id} no encontrado`);
      }
    }

    return nuevoEstado;
  }

  async put(id: string, auditoriaNuevoEstado: AuditoriaPadreEstadoDto) {
    const fecha = new Date();
    const auditoriasEnPlan = await this.AuditoriaPadreModel.find({
      plan_auditoria_id: id,
      activo: true,
    });

    const estadosAnteriores = await this.AuditoriaPadreEstadoModel.find({
      auditoria_padre_id: { $in: auditoriasEnPlan.map((a) => a._id) },
      actual: true,
    });

    if (estadosAnteriores.length > 0) {
      await this.AuditoriaPadreEstadoModel.updateMany(
        {
          auditoria_padre_id: { $in: auditoriasEnPlan.map((a) => a._id) },
          actual: true,
        },
        { $set: { actual: false } },
      );
    }

    const nuevosEstados = auditoriasEnPlan.map((auditoria) => ({
      auditoria_padre_id: auditoria._id,
      usuario_id: auditoriaNuevoEstado.usuario_id,
      usuario_rol: auditoriaNuevoEstado.usuario_rol,
      observacion: auditoriaNuevoEstado.observacion,
      estado_id: auditoriaNuevoEstado.estado_id,
      fase_id: auditoriaNuevoEstado.fase_id,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    }));

    const estadosCreados = await this.AuditoriaPadreEstadoModel.insertMany(nuevosEstados);

    await this.AuditoriaPadreModel.updateMany(
      { _id: { $in: auditoriasEnPlan.map((a) => a._id) } },
      { $set: { estado_id: auditoriaNuevoEstado.estado_id } },
    );

    return estadosCreados;
  }
}
