import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccionMejora,
  AccionMejoraSchema,
} from './schema/accion-mejora.schema';
import {
  PlanMejoramiento,
  PlanMejoramientoSchema,
} from '../plan-mejoramiento/schema/plan-mejoramiento.schema';
import { Hallazgo, HallazgoSchema } from '../hallazgo/schemas/hallazgo.schema';
import {
  AccionMejoraEstado,
  AccionMejoraEstadoSchema,
} from '../accion-mejora-estado/schema/accion-mejora-estado.schema';
import { AccionMejoraController } from './accion-mejora.controller';
import { AccionMejoraService } from './accion-mejora.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccionMejora.name, schema: AccionMejoraSchema },
      { name: PlanMejoramiento.name, schema: PlanMejoramientoSchema },
      { name: Hallazgo.name, schema: HallazgoSchema },
      { name: AccionMejoraEstado.name, schema: AccionMejoraEstadoSchema },
    ]),
  ],
  controllers: [AccionMejoraController],
  providers: [AccionMejoraService],
  exports: [AccionMejoraService],
})
export class AccionMejoraModule {}
