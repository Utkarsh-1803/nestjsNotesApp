import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    stopAtFirstError: true,
    whitelist: true,
    forbidNonWhitelisted: true, // Add this line
  }));
  // Set a global prefix for all routes
  app.setGlobalPrefix('api'); // Set your desired prefix, e.g., '/api'
  await app.listen(process.env.SCREENING_PORT);
  Logger.log(`App is listening on  port: ${process.env.SCREENING_PORT}`);
}
bootstrap();