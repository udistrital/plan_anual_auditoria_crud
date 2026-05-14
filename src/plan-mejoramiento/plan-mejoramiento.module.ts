import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlanMejoramiento,
  PlanMejoramientoSchema,
} from './schema/plan-mejoramiento.schema';
import { PlanMejoramientoController } from './plan-mejoramiento.controller';
import { PlanMejoramientoService } from './plan-mejoramiento.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanMejoramiento.name, schema: PlanMejoramientoSchema },
    ]),
  ],
  controllers: [PlanMejoramientoController],
  providers: [PlanMejoramientoService],
  exports: [PlanMejoramientoService],
})
export class PlanMejoramientoModule {}
