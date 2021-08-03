import Router from 'koa-router';
import { ApolloServer } from 'apollo-server-koa';

import HttpError from '../utils/HttpError';

function createRouter(apolloServer: ApolloServer) {
  const router = new Router();

  router.get('/', async (ctx, next) => {
    ctx.body = { msg: 'Hello World!' };

    throw new HttpError(401, 'Unauthorized');

    await next();
  });

  router.all('/graphql', apolloServer.getMiddleware());

  return router;
}

export { createRouter };
