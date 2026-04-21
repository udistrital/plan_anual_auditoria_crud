import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditoriaPadre } from '../auditoria-padre/schemas/auditoria-padre.schema';
import { AuditoriaPadreDTO } from 'src/auditoria-padre/dto/auditoria-padre.dto';
import { AuditoriaPadreEstado } from '../auditoria-padre-estado/schema/auditoria-padre-estado.schema';
import { AuditoriaPadreEstadoDto } from 'src/auditoria-padre-estado/dto/auditoria-padre-estado.dto';
import { CreateAuditoriaGestion } from './dto/create-auditoria-gestion.dto';
import { PlanAuditoria } from '../plan-auditoria/schemas/plan-auditoria.schema';

interface DatosEstado {
  usuario_id: number;
  usuario_rol: string;
  observacion?: string;
  estado_id: number;
  fase_id?: string;
}

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

  private async obtenerAuditoriasPorPlan(planId: string) {
    return this.AuditoriaPadreModel.find({
      plan_auditoria_id: new Types.ObjectId(planId),
      activo: true,
    });
  }

  private async desactivarEstadosActuales(
    idsAuditorias: Types.ObjectId[],
  ): Promise<void> {
    await this.AuditoriaPadreEstadoModel.updateMany(
      {
        auditoria_padre_id: { $in: idsAuditorias },
        actual: true,
      },
      { $set: { actual: false } },
    );
  }

  private crearNuevosEstados(
    auditorias: AuditoriaPadre[],
    datosEstado: DatosEstado,
    fecha: Date,
  ): AuditoriaPadreEstadoDto[] {
    const nuevosEstados: AuditoriaPadreEstadoDto[] = auditorias.map(
      (auditoria) => ({
        auditoria_padre_id: new Types.ObjectId(auditoria._id),
        usuario_id: datosEstado.usuario_id,
        usuario_rol: datosEstado.usuario_rol,
        observacion: datosEstado.observacion,
        estado_id: datosEstado.estado_id,
        fase_id: datosEstado.fase_id,
        actual: true,
        activo: true,
        fecha_ejecucion_estado: fecha,
      }),
    );
    return nuevosEstados;
  }

  private async actualizarEstadoAuditorias(
    idsAuditorias: Types.ObjectId[],
    estadoId: number,
  ): Promise<void> {
    await this.AuditoriaPadreModel.updateMany(
      { _id: { $in: idsAuditorias } },
      { $set: { estado_id: estadoId } },
    );
  }

  async post(createAuditoriaGestionDto: CreateAuditoriaGestion) {
    const fecha = new Date();

    const auditoriaPadreData = {
      ...createAuditoriaGestionDto,
      activo: true,
      fecha_creacion: fecha,
      fecha_modificacion: fecha,
    } as AuditoriaPadreDTO;

    const nuevaAuditoriaPadre =
      await this.AuditoriaPadreModel.create(auditoriaPadreData);

    const nuevoEstadoData: AuditoriaPadreEstadoDto = {
      auditoria_padre_id: new Types.ObjectId(nuevaAuditoriaPadre._id),
      usuario_id: createAuditoriaGestionDto.usuario_id,
      usuario_rol: createAuditoriaGestionDto.usuario_rol,
      observacion: createAuditoriaGestionDto.observacion,
      estado_id: createAuditoriaGestionDto.estado_id,
      fase_id: createAuditoriaGestionDto.fase_id,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };

    const nuevoEstado =
      await this.AuditoriaPadreEstadoModel.create(nuevoEstadoData);

    if (createAuditoriaGestionDto.plan_auditoria_id) {
      const planActualizado = await this.PlanAuditoriaModel.findByIdAndUpdate(
        createAuditoriaGestionDto.plan_auditoria_id,
        { $push: { auditorias: nuevaAuditoriaPadre._id.toString() } },
        { new: true },
      );

      if (!planActualizado) {
        throw new Error(
          `Plan de auditoría con ID ${createAuditoriaGestionDto.plan_auditoria_id} no encontrado`,
        );
      }
    }

    return nuevoEstado;
  }

  async put(id: string, auditoriaNuevoEstado: AuditoriaPadreEstadoDto) {
    const fecha = new Date();
    const auditoriasEnPlan = await this.obtenerAuditoriasPorPlan(id);

    if (auditoriasEnPlan.length === 0) {
      return [];
    }

    const idsAuditorias = auditoriasEnPlan.map(
      (a) => new Types.ObjectId(a._id),
    );

    await this.desactivarEstadosActuales(idsAuditorias);

    const nuevosEstados = this.crearNuevosEstados(
      auditoriasEnPlan,
      auditoriaNuevoEstado,
      fecha,
    );

    const estadosCreados =
      await this.AuditoriaPadreEstadoModel.insertMany(nuevosEstados);

    await this.actualizarEstadoAuditorias(
      idsAuditorias,
      auditoriaNuevoEstado.estado_id,
    );

    return estadosCreados;
  }

  async deleteMasivo(planId: string, datosUsuario: DatosEstado) {
    const fecha = new Date();

    const plan = await this.PlanAuditoriaModel.findById(planId).exec();
    if (!plan) {
      throw new Error(`Plan de auditoría con ID ${planId} no encontrado`);
    }

    const auditoriasEnPlan = await this.obtenerAuditoriasPorPlan(planId);

    if (auditoriasEnPlan.length === 0) {
      return {
        message: 'No se encontraron auditorías para eliminar',
        eliminadas: 0,
      };
    }

    const idsAuditorias = auditoriasEnPlan.map(
      (a) => new Types.ObjectId(a._id),
    );

    await this.desactivarEstadosActuales(idsAuditorias);

    const nuevosEstadosEliminacion = this.crearNuevosEstados(
      auditoriasEnPlan,
      {
        ...datosUsuario,
        observacion: datosUsuario.observacion || 'Auditoría eliminada',
      },
      fecha,
    );

    await this.AuditoriaPadreEstadoModel.insertMany(nuevosEstadosEliminacion);

    await this.AuditoriaPadreModel.updateMany(
      { _id: { $in: idsAuditorias } },
      {
        $set: {
          activo: false,
          estado_id: datosUsuario.estado_id,
          fecha_eliminacion: fecha,
          fecha_modificacion: fecha,
        },
      },
    );

    await this.PlanAuditoriaModel.findByIdAndUpdate(
      planId,
      {
        $set: {
          auditorias: [],
          fecha_modificacion: fecha,
        },
      },
      { new: true },
    );

    return {
      message: 'Auditorías eliminadas exitosamente',
      eliminadas: auditoriasEnPlan.length,
      auditorias_ids: idsAuditorias.map((id) => id.toString()),
    };
  }

  async deleteUnica(
    auditoriaId: string,
    planId: string,
    datosUsuario: DatosEstado,
  ) {
    const fecha = new Date();

    const auditoria = await this.AuditoriaPadreModel.findOne({
      _id: auditoriaId,
      activo: true,
    });

    if (!auditoria) {
      throw new Error(`Auditoría con ID ${auditoriaId} no encontrada`);
    }

    await this.desactivarEstadosActuales([auditoria._id]);

    const nuevoEstadoEliminacion: AuditoriaPadreEstadoDto = {
      auditoria_padre_id: new Types.ObjectId(auditoria._id),
      usuario_id: datosUsuario.usuario_id,
      usuario_rol: datosUsuario.usuario_rol,
      observacion: datosUsuario.observacion || 'Auditoría eliminada',
      estado_id: datosUsuario.estado_id,
      fase_id: datosUsuario.fase_id,
      actual: true,
      activo: true,
      fecha_ejecucion_estado: fecha,
    };

    await this.AuditoriaPadreEstadoModel.create(nuevoEstadoEliminacion);

    await this.AuditoriaPadreModel.findByIdAndUpdate(auditoriaId, {
      activo: false,
      estado_id: datosUsuario.estado_id,
      fecha_eliminacion: fecha,
      fecha_modificacion: fecha,
    });

    await this.PlanAuditoriaModel.findByIdAndUpdate(planId, {
      $pull: { auditorias: auditoriaId },
      fecha_modificacion: fecha,
    });

    return {
      message: 'Auditoría eliminada exitosamente',
      auditoria_id: auditoriaId,
    };
  }
}
