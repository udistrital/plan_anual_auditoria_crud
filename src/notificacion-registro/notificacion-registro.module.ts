import { Module } from '@nestjs/common';
import { NotificacionRegistroController } from './notificacion-registro.controller';
import { NotificacionRegistroService } from './notificacion-registro.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NotificacionRegistro,
  NotificacionRegistroSchema,
} from './schema/notificacion-registro.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NotificacionRegistro.name,
        schema: NotificacionRegistroSchema,
      },
    ]),
  ],
  controllers: [NotificacionRegistroController],
  providers: [NotificacionRegistroService],
  exports: [NotificacionRegistroService],
})
export class NotificacionRegistroModule {}