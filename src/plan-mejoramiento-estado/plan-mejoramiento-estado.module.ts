import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlanMejoramientoEstado,
  PlanMejoramientoEstadoSchema,
} from './schema/plan-mejoramiento-estado.schema';
import {
  PlanMejoramiento,
  PlanMejoramientoSchema,
} from '../plan-mejoramiento/schema/plan-mejoramiento.schema';
import { PlanMejoramientoEstadoController } from './plan-mejoramiento-estado.controller';
import { PlanMejoramientoEstadoService } from './plan-mejoramiento-estado.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PlanMejoramientoEstado.name,
        schema: PlanMejoramientoEstadoSchema,
      },
      { name: PlanMejoramiento.name, schema: PlanMejoramientoSchema },
    ]),
  ],
  controllers: [PlanMejoramientoEstadoController],
  providers: [PlanMejoramientoEstadoService],
  exports: [PlanMejoramientoEstadoService],
})
export class PlanMejoramientoEstadoModule {}
