import { Module } from '@nestjs/common';
import { PlanAuditoriaController } from './plan-auditoria.controller';
import { PlanAuditoriaService } from './plan-auditoria.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlanAuditoria,
  PlanAuditoriaSchema,
} from './schemas/plan-auditoria.schema';
import { AuditoriaPadreModule } from 'src/auditoria-padre/auditoria-padre.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanAuditoria.name, schema: PlanAuditoriaSchema },
    ]),
    AuditoriaPadreModule,
  ],
  controllers: [PlanAuditoriaController],
  providers: [PlanAuditoriaService],
  exports: [PlanAuditoriaService],
})
export class PlanAuditoriaModule {}
