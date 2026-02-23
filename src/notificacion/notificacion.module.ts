import { Module } from '@nestjs/common';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notificacion,
  NotificacionSchema,
} from './schema/notificacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notificacion.name,
        schema: NotificacionSchema,
      },
    ]),
  ],
  controllers: [NotificacionController],
  providers: [NotificacionService],
  exports: [NotificacionService],
})
export class NotificacionModule {}
