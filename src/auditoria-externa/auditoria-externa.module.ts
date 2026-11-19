import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditoriaExterna,
  AuditoriaExternaSchema,
} from './schema/auditoria-externa.schema';
import { AuditoriaExternaController } from './auditoria-externa.controller';
import { AuditoriaExternaService } from './auditoria-externa.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditoriaExterna.name, schema: AuditoriaExternaSchema },
    ]),
  ],
  controllers: [AuditoriaExternaController],
  providers: [AuditoriaExternaService],
  exports: [AuditoriaExternaService],
})
export class AuditoriaExternaModule {}
