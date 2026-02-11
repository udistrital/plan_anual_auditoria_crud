import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { AuditoriaEstado } from '../auditoria-estado/schema/auditoria-estado.schema';
import { AuditoriaEstadoDto } from 'src/auditoria-estado/dto/auditoria-estado.dto';
import { CreateAuditoriaGestion } from './dto/create-auditoria-gestion.dto';

@Injectable()
export class AuditoriaGestionService {
  constructor(
    @InjectModel(Auditoria.name)
    private readonly auditoriaModel: Model<Auditoria>,
    @InjectModel(AuditoriaEstado.name)
    private readonly auditoriaEstadoModel: Model<AuditoriaEstado>,
    @InjectConnection() private readonly connection: Connection, // Necesario para transacciones
  ) {}

  async post(dto: CreateAuditoriaGestion) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const fecha = new Date();

      // Creamos la auditoría principal
      const [nuevaAuditoria] = await this.auditoriaModel.create(
        [
          {
            ...dto,
            activo: true,
            fecha_creacion: fecha,
            fecha_modificacion: fecha,
          },
        ],
        { session },
      );

      // Creamos el estado inicial vinculado
      const estadoInicial = await this.auditoriaEstadoModel.create(
        [
          {
            ...dto,
            auditoria_id: nuevaAuditoria._id,
            actual: true,
            activo: true,
            fecha_ejecucion_estado: fecha,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return estadoInicial[0];
    } catch (error) {
      await session.abortTransaction();
      console.error('Error en AuditoriaGestion:', error);
      throw new InternalServerErrorException(
        'Error al crear auditoría y estado',
      );
    } finally {
      session.endSession();
    }
  }

  async put(planId: string, nuevoEstadoDto: AuditoriaEstadoDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const fecha = new Date();

      // 1. Buscamos las auditorías relacionadas al plan
      const auditoriasIds = await this.auditoriaModel
        .find({ plan_auditoria_id: planId, activo: true })
        .distinct('_id');

      if (!auditoriasIds.length) return [];

      // 2. Desactivamos todos los estados "actuales" de esas auditorías en un solo paso
      await this.auditoriaEstadoModel.updateMany(
        { auditoria_id: { $in: auditoriasIds }, actual: true },
        { $set: { actual: false } },
        { session },
      );

      // 3. Preparamos los nuevos estados (Inmutabilidad)
      const nuevosEstados = auditoriasIds.map((id) => ({
        ...nuevoEstadoDto,
        auditoria_id: id,
        actual: true,
        activo: true,
        fecha_ejecucion_estado: fecha,
      }));

      const resultados = await this.auditoriaEstadoModel.insertMany(
        nuevosEstados,
        { session },
      );

      await session.commitTransaction();
      return resultados;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
