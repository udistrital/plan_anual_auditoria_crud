import { Module } from '@nestjs/common';
import { InformeController } from './informe.controller';
import { InformeService } from './informe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Informe, InformeSchema } from './schemas/informe.schema';
import { Tema, TemaSchema } from '../tema/schemas/tema.schema';
import { InformeEstadoModule } from '../informe-estado/informe-estado.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Informe.name, schema: InformeSchema },
      { name: Tema.name, schema: TemaSchema },
    ]),
    InformeEstadoModule,
  ],
  controllers: [InformeController],
  providers: [InformeService],
  exports: [InformeService],
})
export class InformeModule {}
