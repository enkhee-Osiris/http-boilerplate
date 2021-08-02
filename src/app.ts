import Koa from 'koa';
import Router from 'koa-router';
import { ApolloServer, gql } from 'apollo-server-koa';

import { context } from './context';
import { typeDefs, resolvers } from './schema';

async function createApp() {
  const server = new ApolloServer({
    typeDefs: gql(typeDefs),
    context,
    resolvers,
  });

  await server.start();

  const app = new Koa();
  const router = new Router();

  server.applyMiddleware({ app });

  router.get('/', async (ctx, next) => {
    ctx.body = { msg: 'Hello World!' };

    await next();
  });

  router.get('/graphql', server.getMiddleware());

  router.post('/graphql', server.getMiddleware());

  app.use(router.routes()).use(router.allowedMethods());

  return app;
}

export { createApp };
