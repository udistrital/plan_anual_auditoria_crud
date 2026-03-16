import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditoriaPadre,
  AuditoriaPadreSchema,
} from '../auditoria-padre/schemas/auditoria-padre.schema';
import {
  AuditoriaPadreEstado,
  AuditoriaPadreEstadoSchema,
} from './schema/auditoria-padre-estado.schema';
import { EstadoAuditoriaPadreController } from './auditoria-padre-estado.controller';
import { EstadoAuditoriaPadreService } from './auditoria-padre-estado.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditoriaPadreEstado.name, schema: AuditoriaPadreEstadoSchema },
      { name: AuditoriaPadre.name, schema: AuditoriaPadreSchema },
    ]),
  ],
  controllers: [EstadoAuditoriaPadreController],
  providers: [EstadoAuditoriaPadreService],
  exports: [EstadoAuditoriaPadreService],
})
export class EstadoAuditoriaPadreModule {}
