import { Module } from '@nestjs/common';
import { TemaController } from './tema.controller';
import { TemaService } from './tema.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tema, TemaSchema } from './schemas/tema.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tema.name, schema: TemaSchema },
    ]),
  ],
  controllers: [TemaController],
  providers: [TemaService],
  exports: [TemaService]
})
export class TemaModule {}