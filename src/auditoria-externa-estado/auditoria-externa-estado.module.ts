import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditoriaExterna,
  AuditoriaExternaSchema,
} from '../auditoria-externa/schema/auditoria-externa.schema';
import {
  AuditoriaExternaEstado,
  AuditoriaExternaEstadoSchema,
} from './schema/auditoria-externa-estado.schema';
import { AuditoriaExternaEstadoController } from './auditoria-externa-estado.controller';
import { AuditoriaExternaEstadoService } from './auditoria-externa-estado.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AuditoriaExternaEstado.name,
        schema: AuditoriaExternaEstadoSchema,
      },
      { name: AuditoriaExterna.name, schema: AuditoriaExternaSchema },
    ]),
  ],
  controllers: [AuditoriaExternaEstadoController],
  providers: [AuditoriaExternaEstadoService],
  exports: [AuditoriaExternaEstadoService],
})
export class AuditoriaExternaEstadoModule {}
