import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccionMejoraEstado,
  AccionMejoraEstadoSchema,
} from './schema/accion-mejora-estado.schema';
import {
  AccionMejora,
  AccionMejoraSchema,
} from '../accion-mejora/schema/accion-mejora.schema';
import { AccionMejoraEstadoController } from './accion-mejora-estado.controller';
import { AccionMejoraEstadoService } from './accion-mejora-estado.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AccionMejoraEstado.name,
        schema: AccionMejoraEstadoSchema,
      },
      { name: AccionMejora.name, schema: AccionMejoraSchema },
    ]),
  ],
  controllers: [AccionMejoraEstadoController],
  providers: [AccionMejoraEstadoService],
  exports: [AccionMejoraEstadoService],
})
export class AccionMejoraEstadoModule {}
