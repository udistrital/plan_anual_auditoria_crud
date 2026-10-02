import { Module } from '@nestjs/common';
import { HallazgoRemisionController } from './hallazgo-remision.controller';
import { HallazgoRemisionService } from './hallazgo-remision.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HallazgoRemision,
  HallazgoRemisionSchema,
} from './schema/hallazgo-remision.schema';
import { Hallazgo, HallazgoSchema } from '../hallazgo/schemas/hallazgo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HallazgoRemision.name, schema: HallazgoRemisionSchema },
      { name: Hallazgo.name, schema: HallazgoSchema },
    ]),
  ],
  controllers: [HallazgoRemisionController],
  providers: [HallazgoRemisionService],
  exports: [HallazgoRemisionService],
})
export class HallazgoRemisionModule {}
