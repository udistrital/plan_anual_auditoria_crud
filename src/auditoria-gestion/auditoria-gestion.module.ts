import { Module } from '@nestjs/common';
import { AuditoriaGestionService } from './auditoria-gestion.service';
import { AuditoriaGestionController } from './auditoria-gestion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditoriaEstado,
  AuditoriaEstadoSchema,
} from '../auditoria-estado/schema/auditoria-estado.schema';
import {
  Auditoria,
  AuditoriaSchema,
} from '../auditoria/schemas/auditoria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditoriaEstado.name, schema: AuditoriaEstadoSchema },
      { name: Auditoria.name, schema: AuditoriaSchema },
    ]),
  ],
  controllers: [AuditoriaGestionController],
  providers: [AuditoriaGestionService],
  exports: [AuditoriaGestionService],
})
export class AuditoriaGestionModule {}
