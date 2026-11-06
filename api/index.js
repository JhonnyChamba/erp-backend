require('reflect-metadata');
require('pg');
require('argon2');
require('class-validator');
require('class-transformer');

module.exports = async function vercelHandler(req, res) {
  try {
    const handler = require('../dist/main').default;
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
