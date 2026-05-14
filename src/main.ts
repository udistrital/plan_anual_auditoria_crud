import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

async function loadSsmParameters() {
  const parameterStore = process.env.PARAMETER_STORE;
  if (!parameterStore) return;

  const client = new SSMClient({});

  const [userRes, passRes] = await Promise.all([
    client.send(
      new GetParameterCommand({
        Name: `/${parameterStore}/plan_anual_auditoria_crud/db/username`,
      }),
    ),
    client.send(
      new GetParameterCommand({
        Name: `/${parameterStore}/plan_anual_auditoria_crud/db/password`,
        WithDecryption: true,
      }),
    ),
  ]);

  if (!userRes.Parameter?.Value || !passRes.Parameter?.Value) {
    throw new Error('No se pudieron cargar parámetros desde AWS SSM');
  }

  process.env.PLAN_ANUAL_AUDITORIA_USER = userRes.Parameter.Value;
  process.env.PLAN_ANUAL_AUDITORIA_PASS = passRes.Parameter.Value;
}

async function bootstrap() {
  await loadSsmParameters();

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Plan Anual Auditoria CRUD')
    .setDescription(
      'API CRUD para la gestión de las auditoría y planes de mejoramiento de Sísifo v2',
    )
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  SwaggerModule.setup('swagger', app, document);

  await app.listen(8080);
}
bootstrap();
