import { Context, Next } from 'koa';
// import { sign, verify } from 'jsonwebtoken';

import { hasher } from '../utils/user.util';
import prismaClient from '../utils/prismaClient';
import HttpError from '../utils/HttpError';

interface SignUpBody {
  password?: string;
  email?: string;
  name?: string;
}

const SIGN_UP = {
  path: '/sign-up',
  middleware: async (ctx: Context, next: Next) => {
    const { email, password, name } = <SignUpBody>ctx.request.body;

    if (!password || !email) {
      throw new HttpError(400, 'Invalid payload');
    }

    const foundUser = await prismaClient.user.findUnique({ where: { email } });

    if (foundUser) {
      throw new HttpError(400, 'E-mail already registered');
    }

    const { salt, hash } = hasher(password);

    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        salt,
        password: hash,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    ctx.body = { user };

    await next();
  },
};

const SIGN_IN = {
  path: '/sign-in',
  middleware: async (ctx, next) => {
    console.log(ctx.request.body);

    await next();
  },
};

const SECURED_ROUTES = {
  path: /^\/graphql(?:\/|$)/,
  middleware: async (ctx, next) => {
    try {
      console.log(ctx.request.body);

      await next();
    } catch (err) {
      throw new HttpError(401, 'Uknown user');
    }
  },
};

export { SIGN_UP, SIGN_IN, SECURED_ROUTES };
