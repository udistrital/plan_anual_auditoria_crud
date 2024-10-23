import { Module } from '@nestjs/common';
import { PlanAuditoriaController } from './plan-auditoria.controller';
import { PlanAuditoriaService } from './plan-auditoria.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanAuditoria, PlanAuditoriaSchema } from './schemas/plan-auditoria.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanAuditoria.name, schema: PlanAuditoriaSchema },
    ]),
  ],
  controllers: [PlanAuditoriaController],
  providers: [PlanAuditoriaService]
})
export class PlanAuditoriaModule {}
