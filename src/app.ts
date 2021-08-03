import Koa from 'koa';
import { ApolloServer } from 'apollo-server-koa';
import { PrismaClient } from '@prisma/client';

import { createRouter } from './routes';
import { exceptionMiddleware } from './middlewares';
import schema from './schemas';

async function createApp() {
  const prisma = new PrismaClient();

  const apolloServer = new ApolloServer({
    schema,
    context: () => ({
      prisma,
    }),
  });
  await apolloServer.start();

  const app = new Koa();
  const router = createRouter(apolloServer);

  app.use(exceptionMiddleware);

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

export { createApp };
