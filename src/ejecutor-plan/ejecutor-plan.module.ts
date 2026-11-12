import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EjecutorPlan,
  EjecutorPlanSchema,
} from './schema/ejecutor-plan.schema';
import {
  EjecutorDependencia,
  EjecutorDependenciaSchema,
} from '../ejecutor-dependencia/schema/ejecutor-dependencia.schema';
import {
  PlanMejoramiento,
  PlanMejoramientoSchema,
} from '../plan-mejoramiento/schema/plan-mejoramiento.schema';
import {
  Auditoria,
  AuditoriaSchema,
} from '../auditoria/schemas/auditoria.schema';
import {
  AuditoriaPadre,
  AuditoriaPadreSchema,
} from '../auditoria-padre/schemas/auditoria-padre.schema';
import { EjecutorPlanController } from './ejecutor-plan.controller';
import { EjecutorPlanService } from './ejecutor-plan.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EjecutorPlan.name, schema: EjecutorPlanSchema },
      { name: EjecutorDependencia.name, schema: EjecutorDependenciaSchema },
      { name: PlanMejoramiento.name, schema: PlanMejoramientoSchema },
      { name: Auditoria.name, schema: AuditoriaSchema },
      { name: AuditoriaPadre.name, schema: AuditoriaPadreSchema },
    ]),
  ],
  controllers: [EjecutorPlanController],
  providers: [EjecutorPlanService],
  exports: [EjecutorPlanService],
})
export class EjecutorPlanModule {}
