import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditoriaPadre,
  AuditoriaPadreSchema,
} from '../auditoria-padre/schemas/auditoria-padre.schema';
import { ResumenPlanMejoramientoController } from './resumen-plan-mejoramiento.controller';
import { ResumenPlanMejoramientoService } from './resumen-plan-mejoramiento.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditoriaPadre.name, schema: AuditoriaPadreSchema },
    ]),
  ],
  controllers: [ResumenPlanMejoramientoController],
  providers: [ResumenPlanMejoramientoService],
})
export class ResumenPlanMejoramientoModule {}
