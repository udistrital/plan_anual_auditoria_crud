import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ComentarioAccion,
  ComentarioAccionSchema,
} from './schema/comentario-accion.schema';
import {
  AccionMejora,
  AccionMejoraSchema,
} from '../accion-mejora/schema/accion-mejora.schema';
import { ComentarioAccionController } from './comentario-accion.controller';
import { ComentarioAccionService } from './comentario-accion.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ComentarioAccion.name, schema: ComentarioAccionSchema },
      { name: AccionMejora.name, schema: AccionMejoraSchema },
    ]),
  ],
  controllers: [ComentarioAccionController],
  providers: [ComentarioAccionService],
  exports: [ComentarioAccionService],
})
export class ComentarioAccionModule {}
