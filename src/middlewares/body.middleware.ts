import koaBody from 'koa-body';

import HttpError from '../utils/HttpError';

const bodyMiddleware = koaBody({
  onError: () => {
    throw new HttpError(422, 'Body parse error');
  },
});

export default bodyMiddleware;
