import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Auditoria } from '../auditoria/schemas/auditoria.schema';
import { PlanAuditoriaSchema } from '../plan-auditoria/schemas/plan-auditoria.schema';
import {
  ProgramaEstado,
  ProgramaEstadoSchema,
} from './schema/programa-estado.schema';
import { ProgramaEstadoController } from './programa-estado.controller';
import { ProgramaEstadoService } from './programa-estado.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProgramaEstado.name, schema: ProgramaEstadoSchema },
      { name: Auditoria.name, schema: PlanAuditoriaSchema },
    ]),
  ],
  controllers: [ProgramaEstadoController],
  providers: [ProgramaEstadoService],
  exports: [ProgramaEstadoService],
})
export class ProgramaEstadoModule {}
