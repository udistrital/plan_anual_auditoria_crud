import { Module } from '@nestjs/common';
import { PlanAuditoriaController } from './plan-auditoria.controller';
import { PlanAuditoriaService } from './plan-auditoria.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlanAuditoria,
  PlanAuditoriaSchema,
} from './schemas/plan-auditoria.schema';
import { AuditoriaModule } from 'src/auditoria/auditoria.module';
import { AuditoriaPadreModule } from 'src/auditoria-padre/auditoria-padre.module';
import { EstadoAuditoriaModule } from 'src/auditoria-estado/auditoria-estado.module';
import { EstadoAuditoriaPadreModule } from 'src/auditoria-padre-estado/auditoria-padre-estado.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanAuditoria.name, schema: PlanAuditoriaSchema },
    ]),
    AuditoriaModule,
    AuditoriaPadreModule,
    EstadoAuditoriaModule,
    EstadoAuditoriaPadreModule,
  ],
  controllers: [PlanAuditoriaController],
  providers: [PlanAuditoriaService],
  exports: [PlanAuditoriaService],
})
export class PlanAuditoriaModule {}
