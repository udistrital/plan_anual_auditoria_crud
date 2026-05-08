import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObservacionController } from './observacion.controller';
import { ObservacionService } from './observacion.service';
import { Observacion, ObservacionSchema } from './schemas/observacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Observacion.name, schema: ObservacionSchema },
    ]),
  ],
  controllers: [ObservacionController],
  providers: [ObservacionService],
  exports: [ObservacionService],
})
export class ObservacionModule {}
