import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditoriaExterna,
  AuditoriaExternaSchema,
} from '../auditoria-externa/schema/auditoria-externa.schema';
import {
  AuditoriaExternaHallazgo,
  AuditoriaExternaHallazgoSchema,
} from './schema/auditoria-externa-hallazgo.schema';
import { AuditoriaExternaHallazgoController } from './auditoria-externa-hallazgo.controller';
import { AuditoriaExternaHallazgoService } from './auditoria-externa-hallazgo.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AuditoriaExternaHallazgo.name,
        schema: AuditoriaExternaHallazgoSchema,
      },
      { name: AuditoriaExterna.name, schema: AuditoriaExternaSchema },
    ]),
  ],
  controllers: [AuditoriaExternaHallazgoController],
  providers: [AuditoriaExternaHallazgoService],
  exports: [AuditoriaExternaHallazgoService],
})
export class AuditoriaExternaHallazgoModule {}
