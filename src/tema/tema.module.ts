import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemaController } from './tema.controller';
import { SubtemaController } from './subtema.controller';
import { TemaService } from './tema.service';
import { Tema, TemaSchema } from './schemas/tema.schema';
import { Hallazgo, HallazgoSchema } from '../hallazgo/schemas/hallazgo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tema.name, schema: TemaSchema },
      { name: Hallazgo.name, schema: HallazgoSchema },
    ]),
  ],
  controllers: [TemaController, SubtemaController],
  providers: [TemaService],
  exports: [TemaService],
})
export class TemaModule {}
