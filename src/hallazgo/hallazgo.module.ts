import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HallazgoController } from './hallazgo.controller';
import { HallazgoService } from './hallazgo.service';
import { Hallazgo, HallazgoSchema } from './schemas/hallazgo.schema';
import { Tema, TemaSchema } from '../tema/schemas/tema.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hallazgo.name, schema: HallazgoSchema },
      { name: Tema.name, schema: TemaSchema },
    ]),
  ],
  controllers: [HallazgoController],
  providers: [HallazgoService],
  exports: [HallazgoService],
})
export class HallazgoModule {}
