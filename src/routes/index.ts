import Router from 'koa-router';

import { SIGN_UP, SIGN_IN, SECURED_ROUTES } from './authentication.route';
import apolloServer from '../utils/apolloServer';

function createRouter() {
  const router = new Router();

  router.get('/', async (ctx, next) => {
    ctx.body = { msg: 'Hello World!' };

    await next();
  });

  router.post(SIGN_UP.path, SIGN_UP.middleware);

  router.post(SIGN_IN.path, SIGN_IN.middleware);

  router.post(SECURED_ROUTES.path, SECURED_ROUTES.middleware);

  router.get('/graphql', apolloServer.landingMiddleware());

  router.all('/graphql', apolloServer.serverMiddleware({ path: '/graphql' }));

  return router;
}

export { createRouter };
