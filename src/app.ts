import fastify from 'fastify';

const isProduction = process.env.NODE_ENV === 'production';

const app = fastify({
  logger: {
    level: isProduction ? 'warn' : 'info',
  },
});

export default app;
