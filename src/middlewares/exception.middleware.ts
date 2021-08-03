import Koa from 'koa';

import HttpError from '../utils/HttpError';

async function exceptionHandler(ctx: Koa.Context, next: Koa.Next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof HttpError) {
      ctx.body = err.toObject();
      ctx.status = err.statusCode;
    } else {
      ctx.body = { message: 'Unexpected error.', statusCode: 500 };
      ctx.status = 500;
    }
  }
}

export default exceptionHandler;
