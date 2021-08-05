import Koa from 'koa';

import { createRouter } from './routes';
import { exceptionMiddleware, bodyMiddleware } from './middlewares';
import apolloServer from './utils/apolloServer';

async function createApp() {
  await apolloServer.start();

  const app = new Koa();
  const router = createRouter();

  app.use(exceptionMiddleware);
  app.use(bodyMiddleware);

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

export { createApp };
