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
import { HallazgoModule } from './hallazgo/hallazgo.module';
import { AuditoriaGestionModule } from './auditoria-gestion/auditoria-gestion.module';
import { NotificacionModule } from './notificacion/notificacion.module';
import { AuditoriaPadreModule } from './auditoria-padre/auditoria-padre.module';
import { EstadoAuditoriaPadreModule } from './auditoria-padre-estado/auditoria-padre-estado.module';
import { ObservacionModule } from './observacion/observacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const user = encodeURIComponent(
          configService.get<string>('PLAN_ANUAL_AUDITORIA_USER'),
        );
        const pass = encodeURIComponent(
          configService.get<string>('PLAN_ANUAL_AUDITORIA_PASS'),
        );
        const host = configService.get<string>('PLAN_ANUAL_AUDITORIA_HOST');
        const port = configService.get<string>('PLAN_ANUAL_AUDITORIA_PORT');
        const db = configService.get<string>('PLAN_ANUAL_AUDITORIA_DB');
        const authDb = configService.get<string>(
          'PLAN_ANUAL_AUDITORIA_AUTH_DB',
        );

        return {
          uri: `mongodb://desarrollooas:desarrollooas2019@mongotest.udistritaloas.edu.co:27017/auditoria?authSource=admin`,
        };
      },
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
    HallazgoModule,
    AuditoriaGestionModule,
    NotificacionModule,
    AuditoriaPadreModule,
    EstadoAuditoriaPadreModule,
    ObservacionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
