"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
let cachedServer;
async function createApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { abortOnError: false });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim());
    app.enableCors({
        origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    return app;
}
async function bootstrap() {
    const app = await createApp();
    const port = process.env.PORT || 3000;
    await app.listen(port);
}
if (!process.env.VERCEL) {
    bootstrap();
}
async function handler(req, res) {
    try {
        if (!cachedServer) {
            const app = await createApp();
            await app.init();
            cachedServer = app.getHttpAdapter().getInstance();
        }
        return cachedServer(req, res);
    }
    catch (error) {
        console.error('Error initializing NestJS server:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
            statusCode: 500,
            message: 'Error al conectar o iniciar NestJS en Vercel',
            error: error?.message || String(error),
        }));
    }
}
//# sourceMappingURL=main.js.map