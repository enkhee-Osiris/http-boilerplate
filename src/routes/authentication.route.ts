import { Context, Next } from 'koa';
import { sign, verify, Algorithm } from 'jsonwebtoken';

import { hasher, verifier } from '../utils/user.util';
import prismaClient from '../utils/prismaClient';
import HttpError from '../utils/HttpError';

const SECRET = 'TOOOSECRET'

interface SignUpBody {
  password?: string;
  email?: string;
  name?: string;
}

interface SignInBody {
  email?: string;
  password?: string;
}

const SIGN_UP = {
  path: '/sign-up',
  middleware: async (ctx: Context, next: Next) => {
    const { email, password, name } = ctx.request.body as SignUpBody;

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
  middleware: async (ctx: Context, next: Next) => {
    const { email, password } = ctx.request.body as SignInBody;

    if (!password || !email) {
      throw new HttpError(400, 'Invalid payload');
    }

    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpError(400, 'Wrong username or password');
    }

    const verified = verifier(password, user.salt, user.password);

    if (!verified) {
      throw new HttpError(400, 'Wrong username or password');
    }

    ctx.body = {
      token: sign({ id: user.id, email: user.email, name: user.name }, SECRET, { algorithm: 'HS256', expiresIn: '1h' }),
    }

    await next();
  },
};

const SECURED_ROUTES = {
  path: /^\/graphql(?:\/|$)/,
  middleware: async (ctx: Context, next: Next) => {
    try {
      let token = ctx.request.headers['authorization'] || '';
      token = token.replace('Bearer ', '');

      ctx.state.user = verify(token, SECRET);
    } catch (err) {
      throw new HttpError(401, 'Uknown user');
    }

    await next();
  },
};

export { SIGN_UP, SIGN_IN, SECURED_ROUTES };
