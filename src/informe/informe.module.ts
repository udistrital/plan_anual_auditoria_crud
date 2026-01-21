import { Module } from '@nestjs/common';
import { InformeController } from './informe.controller';
import { InformeService } from './informe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Informe, InformeSchema } from './schemas/informe.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Informe.name, schema: InformeSchema },
    ]),
  ],
  controllers: [InformeController],
  providers: [InformeService],
  exports: [InformeService]
})
export class InformeModule {}