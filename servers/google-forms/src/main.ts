#!/usr/bin/env node

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  const logger = new Logger('Main');
  const targetPort = appConfig?.port ?? 3000;
  const targetHost = appConfig?.host ?? 'localhost';
  logger.log(`Starting server on ${targetHost}:${targetPort}`);
  await app.listen(targetPort, targetHost);
}
bootstrap();
