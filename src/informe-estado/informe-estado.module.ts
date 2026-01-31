import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Informe, InformeSchema } from '../informe/schemas/informe.schema';
import {
  InformeEstado,
  InformeEstadoSchema,
} from './schemas/informe-estado.schema';
import { InformeEstadoController } from './informe-estado.controller';
import { InformeEstadoService } from './informe-estado.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InformeEstado.name, schema: InformeEstadoSchema },
      { name: Informe.name, schema: InformeSchema },
    ]),
  ],
  controllers: [InformeEstadoController],
  providers: [InformeEstadoService],
  exports: [InformeEstadoService],
})
export class InformeEstadoModule {}