let appHandler = null;

function getHandler() {
  if (!appHandler) {
    require('reflect-metadata');
    require('pg');
    require('argon2');
    require('class-validator');
    require('class-transformer');
    const mainModule = require('../dist/main');
    appHandler = mainModule.default || mainModule;
  }
  return appHandler;
}

module.exports = async function vercelHandler(req, res) {
  // Encabezados CORS universales para Vercel Serverless
  const origin = req.headers.origin || 'https://deskounta.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-company-id, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Responder de inmediato al preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const handler = getHandler();
    return await handler(req, res);
  } catch (error) {
    console.error('Vercel Handler Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        statusCode: 500,
        message: 'Error al inicializar el backend en Vercel',
        error: error && error.message ? error.message : String(error),
      })
    );
  }
};