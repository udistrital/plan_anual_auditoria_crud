import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CalificacionAccion,
  CalificacionAccionSchema,
} from './schema/calificacion-accion.schema';
import {
  AccionMejora,
  AccionMejoraSchema,
} from '../accion-mejora/schema/accion-mejora.schema';
import { CalificacionAccionController } from './calificacion-accion.controller';
import { CalificacionAccionService } from './calificacion-accion.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CalificacionAccion.name, schema: CalificacionAccionSchema },
      { name: AccionMejora.name, schema: AccionMejoraSchema },
    ]),
  ],
  controllers: [CalificacionAccionController],
  providers: [CalificacionAccionService],
  exports: [CalificacionAccionService],
})
export class CalificacionAccionModule {}
