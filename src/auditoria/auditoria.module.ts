import { Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auditoria, AuditoriaSchema } from './schemas/auditoria.schema';
import {
  PlanAuditoria,
  PlanAuditoriaSchema,
} from 'src/plan-auditoria/schemas/plan-auditoria.schema';
import {
  Auditor,
  AuditorSchema,
} from '../auditoria-auditor/schemas/auditor.schema';
import {
  AuditoriaPadre,
  AuditoriaPadreSchema,
} from 'src/auditoria-padre/schemas/auditoria-padre.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auditoria.name, schema: AuditoriaSchema },
      { name: PlanAuditoria.name, schema: PlanAuditoriaSchema },
      { name: AuditoriaPadre.name, schema: AuditoriaPadreSchema },
      { name: Auditor.name, schema: AuditorSchema },
    ]),
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
