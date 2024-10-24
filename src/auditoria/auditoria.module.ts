import { Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auditoria, AuditoriaSchema } from './schemas/auditoria.schema';
import { PlanAuditoria, PlanAuditoriaSchema } from 'src/plan-auditoria/schemas/plan-auditoria.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auditoria.name, schema: AuditoriaSchema },
      { name: PlanAuditoria.name, schema: PlanAuditoriaSchema },
    ]),
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService]
})
export class AuditoriaModule {}
