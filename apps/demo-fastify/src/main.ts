/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { NestjsRedoxModule, NestJSRedoxOptions, RedocOptions } from 'nestjs-redox';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;

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
    theme: {
      sidebar: {
        width: '222px',
      },
    },
  };

  const redoxOptions: NestJSRedoxOptions = {
    useGlobalPrefix: true,
    disableGoogleFont: true,
    standalone: true,
    auth: {
      enabled: true,
      users: {
        test123: 'test123',
        test: 'test',
      },
    },
  };

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
    operationIdFactory: (controllerKey, methodKey) => methodKey,
  });

  NestjsRedoxModule.setup('reference', app, document, redoxOptions, redocOptions);

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
