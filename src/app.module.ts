import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { environment } from './config/configuration';
import { PlanAuditoriaModule } from './plan-auditoria/plan-auditoria.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { ActividadModule } from './actividad/actividad.module';


@Module({
  imports: [
    MongooseModule.forRoot(
    `mongodb://${environment.PLAN_ANUAL_AUDITORIA_USER}:${environment.PLAN_ANUAL_AUDITORIA_PASS}@` +
      `${environment.PLAN_ANUAL_AUDITORIA_HOST}:${environment.PLAN_ANUAL_AUDITORIA_PORT}/${environment.PLAN_ANUAL_AUDITORIA_DB}?authSource=${environment.PLAN_ANUAL_AUDITORIA_AUTH_DB}`,
    ),
    PlanAuditoriaModule,
    AuditoriaModule,
    ActividadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
