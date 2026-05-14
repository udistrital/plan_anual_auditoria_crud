import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResponsableAccion,
  ResponsableAccionSchema,
} from './schema/responsable-accion.schema';
import {
  AccionMejora,
  AccionMejoraSchema,
} from '../accion-mejora/schema/accion-mejora.schema';
import { ResponsableAccionController } from './responsable-accion.controller';
import { ResponsableAccionService } from './responsable-accion.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResponsableAccion.name, schema: ResponsableAccionSchema },
      { name: AccionMejora.name, schema: AccionMejoraSchema },
    ]),
  ],
  controllers: [ResponsableAccionController],
  providers: [ResponsableAccionService],
  exports: [ResponsableAccionService],
})
export class ResponsableAccionModule {}
