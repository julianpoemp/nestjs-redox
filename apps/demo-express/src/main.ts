/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestjsRedoxModule, RedocOptions } from 'nestjs-redox';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('OCTRA API')
    .setDescription('some description')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addSecurity('roles', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();

  const redocOptions: RedocOptions = {
    requiredPropsFirst: true,
  };

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
    operationIdFactory: (controllerKey, methodKey) => methodKey,
  });

  NestjsRedoxModule.setup(
    'reference',
    app as any,
    document,
    {
      useGlobalPrefix: true,
      disableGoogleFont: true,
      standalone: true,
      auth: {
        enabled: true,
        users: {
          "test123": "test123",
          "test": "test"
        }
      }
    },
    redocOptions
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`Reference: http://localhost:${port}/${globalPrefix}/reference`);
}

bootstrap();
