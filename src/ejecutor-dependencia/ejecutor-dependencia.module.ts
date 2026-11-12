import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EjecutorDependencia,
  EjecutorDependenciaSchema,
} from './schema/ejecutor-dependencia.schema';
import { EjecutorDependenciaController } from './ejecutor-dependencia.controller';
import { EjecutorDependenciaService } from './ejecutor-dependencia.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EjecutorDependencia.name,
        schema: EjecutorDependenciaSchema,
      },
    ]),
  ],
  controllers: [EjecutorDependenciaController],
  providers: [EjecutorDependenciaService],
  exports: [EjecutorDependenciaService],
})
export class EjecutorDependenciaModule {}
