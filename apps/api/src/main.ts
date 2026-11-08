import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global API Prefix: /api/v1
  const globalPrefix = configService.get<string>('API_GLOBAL_PREFIX', '/api/v1').replace(/^\//, '');
  app.setGlobalPrefix(globalPrefix);

  // Enable Cross-Origin Resource Sharing (CORS)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AAPADAMITRA API')
    .setDescription(
      'Multi-Hazard Disaster Management & Emergency Coordination Platform REST API'
    )
    .setVersion('0.1.0')
    .addTag('Health', 'System health check verification')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Development route for Swagger documentation: /api/docs
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('API_PORT', 3000);
  await app.listen(port);
  console.log(`[AAPADAMITRA API] Service running on http://localhost:${port}/${globalPrefix}`);
  console.log(`[AAPADAMITRA API] Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();

