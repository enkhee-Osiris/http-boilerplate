import {
  ApolloServerBase,
  convertNodeHttpToRequest,
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import type { Context, Next, Middleware } from 'koa';

import HttpError from './HttpError';
import schema from '../schemas';

class ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(ctx: Context): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ ctx });
  }

  public landingMiddleware(): Middleware {
    return async (ctx: Context) => {
      const landingPage = this.getLandingPage();

      if (landingPage) {
        ctx.set('Content-Type', 'text/html');
        ctx.body = landingPage.html;
      }
    };
  }

  public serverMiddleware(
    { path = '/graphql' }: { path?: string } = { path: '/graphql' },
  ): Middleware {
    return async (ctx: Context, next: Next) => {
      this.assertStarted('getMiddleware');

      this.graphqlPath = path;

      if (ctx.request.method === 'OPTIONS') {
        ctx.status = 204;
        ctx.body = '';

        await next();
      }

      try {
        const { graphqlResponse, responseInit } = await runHttpQuery([ctx], {
          method: ctx.request.method,
          options: () => this.createGraphQLServerOptions(ctx),
          query: ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query,
          request: convertNodeHttpToRequest(ctx.req),
        });

        if (responseInit.headers) {
          Object.entries(responseInit.headers).forEach(([headerName, value]) =>
            ctx.set(headerName, value),
          );
        }

        ctx.body = graphqlResponse;
        ctx.status = responseInit.status || 200;

        await next();
      } catch (e) {
        const error = e as HttpQueryError;

        if (error.name !== 'HttpQueryError') {
          throw error;
        }

        throw new HttpError(error.statusCode, error.message);
      }
    };
  }
}

const apolloServer = new ApolloServer({
  schema,
});

export default apolloServer;
