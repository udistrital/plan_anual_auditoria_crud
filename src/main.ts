import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('plan_anual_auditoria_crud')
  .setDescription(
    'API CRUD para la gestion de planes de auditorias, auditorias y actividades',
  )
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
