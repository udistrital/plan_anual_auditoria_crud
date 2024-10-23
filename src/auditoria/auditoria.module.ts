import { Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria/auditoria.controller';
import { AuditoriaService } from './auditoria/auditoria.service';

@Module({
  controllers: [AuditoriaController],
  providers: [AuditoriaService]
})
export class AuditoriaModule {}
