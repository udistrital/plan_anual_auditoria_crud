import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditoriaPadreController } from './auditoria-padre.controller';
import { AuditoriaPadreService } from './auditoria-padre.service';
import {
  AuditoriaPadre,
  AuditoriaPadreSchema,
} from './schemas/auditoria-padre.schema';
import {
  PlanAuditoria,
  PlanAuditoriaSchema,
} from 'src/plan-auditoria/schemas/plan-auditoria.schema';
import { EstadoAuditoriaPadreModule } from '../auditoria-padre-estado/auditoria-padre-estado.module';
import { AuditoriaModule } from 'src/auditoria/auditoria.module';
import { EstadoAuditoriaModule } from 'src/auditoria-estado/auditoria-estado.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditoriaPadre.name, schema: AuditoriaPadreSchema },
      { name: PlanAuditoria.name, schema: PlanAuditoriaSchema },
    ]),
    EstadoAuditoriaPadreModule,
    AuditoriaModule,
    EstadoAuditoriaModule,
  ],
  controllers: [AuditoriaPadreController],
  providers: [AuditoriaPadreService],
  exports: [AuditoriaPadreService],
})
export class AuditoriaPadreModule {}
