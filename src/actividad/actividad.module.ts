import { Module } from '@nestjs/common';
import { ActividadController } from './actividad.controller';
import { ActividadService } from './actividad.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Actividad, ActividadSchema } from './schemas/actividad.schema';
import { Auditoria, AuditoriaSchema } from 'src/auditoria/schemas/auditoria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Actividad.name, schema: ActividadSchema },
      {name: Auditoria.name, schema: AuditoriaSchema },
    ]),
  ],
  controllers: [ActividadController],
  providers: [ActividadService]
})
export class ActividadModule {}
