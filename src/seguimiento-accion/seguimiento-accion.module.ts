import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SeguimientoAccion,
  SeguimientoAccionSchema,
} from './schema/seguimiento-accion.schema';
import {
  AccionMejora,
  AccionMejoraSchema,
} from '../accion-mejora/schema/accion-mejora.schema';
import { SeguimientoAccionController } from './seguimiento-accion.controller';
import { SeguimientoAccionService } from './seguimiento-accion.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeguimientoAccion.name, schema: SeguimientoAccionSchema },
      { name: AccionMejora.name, schema: AccionMejoraSchema },
    ]),
  ],
  controllers: [SeguimientoAccionController],
  providers: [SeguimientoAccionService],
  exports: [SeguimientoAccionService],
})
export class SeguimientoAccionModule {}
