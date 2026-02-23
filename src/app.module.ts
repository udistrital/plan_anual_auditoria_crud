import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlanAuditoriaModule } from './plan-auditoria/plan-auditoria.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { ActividadModule } from './actividad/actividad.module';
import { EstadoModule } from './estado/estado.module';
import { DocumentoModule } from './documento/documento.module';
import { AuditorModule } from './auditoria-auditor/auditor.module';
import { EstadoAuditoriaModule } from './auditoria-estado/auditoria-estado.module';
import { InformeModule } from './informe/informe.module';
import { TemaModule } from './tema/tema.module';
import { AuditoriaGestionModule } from './auditoria-gestion/auditoria-gestion.module';
import { NotificacionModule } from './notificacion/notificacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri:
          `mongodb://${configService.get('PLAN_ANUAL_AUDITORIA_USER')}:${configService.get('PLAN_ANUAL_AUDITORIA_PASS')}@` +
          `${configService.get('PLAN_ANUAL_AUDITORIA_HOST')}:${configService.get('PLAN_ANUAL_AUDITORIA_PORT')}/${configService.get('PLAN_ANUAL_AUDITORIA_DB')}` +
          `?authSource=${configService.get('PLAN_ANUAL_AUDITORIA_AUTH_DB')}`,
      }),
      inject: [ConfigService],
    }),
    PlanAuditoriaModule,
    AuditoriaModule,
    ActividadModule,
    EstadoModule,
    EstadoAuditoriaModule,
    DocumentoModule,
    AuditorModule,
    InformeModule,
    TemaModule,
    AuditoriaGestionModule,
    NotificacionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
