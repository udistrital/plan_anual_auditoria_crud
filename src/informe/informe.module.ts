import { Module } from '@nestjs/common';
import { InformeController } from './informe.controller';
import { InformeService } from './informe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Informe, InformeSchema } from './schemas/informe.schema';
import { Tema, TemaSchema } from '../tema/schemas/tema.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Informe.name, schema: InformeSchema },
      { name: Tema.name, schema: TemaSchema },
    ]),
  ],
  controllers: [InformeController],
  providers: [InformeService],
  exports: [InformeService]
})
export class InformeModule {}