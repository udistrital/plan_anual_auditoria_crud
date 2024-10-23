import { Module } from '@nestjs/common';
import { ActividadController } from './actividad.controller';
import { ActividadService } from './actividad.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Actividad, ActividadSchema } from './schemas/actividad.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Actividad.name, schema: ActividadSchema },
    ]),
  ],
  controllers: [ActividadController],
  providers: [ActividadService]
})
export class ActividadModule {}
