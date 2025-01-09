import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { PlanAuditoriaSchema } from '../plan-auditoria/schemas/plan-auditoria.schema';
import {
  AuditoriaEstado,
  AuditoriaEstadoSchema,
} from './schema/auditoria-estado.schema';
import { EstadoAuditoriaController } from './auditoria-estado.controller';
import { EstadoAuditoriaService } from './auditoria-estado.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditoriaEstado.name, schema: AuditoriaEstadoSchema },
      { name: Auditoria.name, schema: PlanAuditoriaSchema },
    ]),
  ],
  controllers: [EstadoAuditoriaController],
  providers: [EstadoAuditoriaService],
  exports: [EstadoAuditoriaService],
})
export class EstadoAuditoriaModule {}
