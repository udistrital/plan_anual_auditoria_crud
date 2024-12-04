import { Module } from '@nestjs/common';
import { AuditorController } from './auditor.controller';
import { AuditorService } from './auditor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auditor, AuditorSchema } from './schemas/auditor.schema';
import { Auditoria, AuditoriaSchema } from 'src/auditoria/schemas/auditoria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auditor.name, schema: AuditorSchema },
      { name: Auditoria.name, schema: AuditoriaSchema },
    ]),
  ],
  controllers: [AuditorController],
  providers: [AuditorService],
  exports: [AuditorService]

})
export class AuditorModule {}
