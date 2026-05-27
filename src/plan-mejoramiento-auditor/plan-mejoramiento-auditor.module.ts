import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlanMejoramientoAuditor,
  PlanMejoramientoAuditorSchema,
} from './schema/plan-mejoramiento-auditor.schema';
import {
  PlanMejoramiento,
  PlanMejoramientoSchema,
} from '../plan-mejoramiento/schema/plan-mejoramiento.schema';
import { PlanMejoramientoAuditorController } from './plan-mejoramiento-auditor.controller';
import { PlanMejoramientoAuditorService } from './plan-mejoramiento-auditor.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PlanMejoramientoAuditor.name,
        schema: PlanMejoramientoAuditorSchema,
      },
      { name: PlanMejoramiento.name, schema: PlanMejoramientoSchema },
    ]),
  ],
  controllers: [PlanMejoramientoAuditorController],
  providers: [PlanMejoramientoAuditorService],
  exports: [PlanMejoramientoAuditorService],
})
export class PlanMejoramientoAuditorModule {}
