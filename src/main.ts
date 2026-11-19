import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

async function createApp() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const envOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://deskounta.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (defaultOrigins.includes(origin) || envOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      // Origen no permitido: la respuesta sale sin cabeceras CORS y el navegador la bloquea.
      return callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,x-company-id,Accept,Origin,X-Requested-With',
    credentials: true,
  });

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 3000;
  await app.listen(port);
}

// Ejecución tradicional en local (no se ejecuta como proceso fijo en Vercel Serverless)
if (!process.env.VERCEL) {
  bootstrap();
}

// Handler exportado para Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  try {
    if (!cachedServer) {
      const app = await createApp();
      await app.init();
      cachedServer = app.getHttpAdapter().getInstance();
    }
    return cachedServer(req, res);
  } catch (error: any) {
    console.error('Error initializing NestJS server:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        statusCode: 500,
        message: 'Error al conectar o iniciar NestJS en Vercel',
        error: error?.message || String(error),
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      }),
    );
  }
}
