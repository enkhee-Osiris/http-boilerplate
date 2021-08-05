import Koa from 'koa';

import HttpError from '../utils/HttpError';

async function exceptionMiddleware(ctx: Koa.Context, next: Koa.Next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof HttpError) {
      ctx.body = err.toObject();
      ctx.status = err.statusCode;
    } else {
      console.error(err.message);

      ctx.body = { message: 'Unexpected error.', statusCode: 500 };
      ctx.status = 500;
    }
  }
}

export default exceptionMiddleware;
