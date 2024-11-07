import { Module } from '@nestjs/common';
import { EstadoController } from './estado.controller';
import { EstadoService } from './estado.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanEstado, PlanEstadoSchema } from './schema/estado.schema'
import { PlanAuditoria, PlanAuditoriaSchema } from '../plan-auditoria/schemas/plan-auditoria.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanEstado.name, schema: PlanEstadoSchema },
      { name: PlanAuditoria.name, schema: PlanAuditoriaSchema },
    ]),
  ],
  controllers: [EstadoController],
  providers: [EstadoService],
  exports: [EstadoService]
})
export class EstadoModule { }
