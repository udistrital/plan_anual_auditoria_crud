import { Module } from '@nestjs/common';
import { AuditoriaGestionService } from './auditoria-gestion.service';
import { AuditoriaGestionController } from './auditoria-gestion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditoriaPadreEstado,
  AuditoriaPadreEstadoSchema,
} from '../auditoria-padre-estado/schema/auditoria-padre-estado.schema';
import {
  AuditoriaPadre,
  AuditoriaPadreSchema,
} from '../auditoria-padre/schemas/auditoria-padre.schema';
import {
  PlanAuditoria,
  PlanAuditoriaSchema,
} from '../plan-auditoria/schemas/plan-auditoria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditoriaPadreEstado.name, schema: AuditoriaPadreEstadoSchema },
      { name: AuditoriaPadre.name, schema: AuditoriaPadreSchema },
      { name: PlanAuditoria.name, schema: PlanAuditoriaSchema },
    ]),
  ],
  controllers: [AuditoriaGestionController],
  providers: [AuditoriaGestionService],
  exports: [AuditoriaGestionService],
})
export class AuditoriaGestionModule {}
