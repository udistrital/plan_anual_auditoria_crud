import { Module } from '@nestjs/common';
import { DocumentoController } from './documento.controller';
import { DocumentoService } from './documento.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Documento, DocumentoSchema } from './schemas/documento.schema';
import { Auditoria, AuditoriaSchema } from '../auditoria/schemas/auditoria.schema'
import { PlanAuditoria, PlanAuditoriaSchema } from '../plan-auditoria/schemas/plan-auditoria.schema'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Documento.name, schema: DocumentoSchema },
    ]),
  ],
  controllers: [DocumentoController],
  providers: [DocumentoService],
  exports: [DocumentoService]
})
export class DocumentoModule {}
