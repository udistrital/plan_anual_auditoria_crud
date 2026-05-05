import { Module } from '@nestjs/common';
import { InformeController } from './informe.controller';
import { InformeService } from './informe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Informe, InformeSchema } from './schemas/informe.schema';
import { Tema, TemaSchema } from '../tema/schemas/tema.schema';
import { Hallazgo, HallazgoSchema } from '../hallazgo/schemas/hallazgo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Informe.name, schema: InformeSchema },
      { name: Tema.name, schema: TemaSchema },
      { name: Hallazgo.name, schema: HallazgoSchema },
    ]),
  ],
  controllers: [InformeController],
  providers: [InformeService],
  exports: [InformeService],
})
export class InformeModule {}
