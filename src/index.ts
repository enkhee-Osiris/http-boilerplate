import serverless from 'serverless-http';
import app from './app';

import type { Handler } from 'aws-lambda';

const hello: Handler = async (event, context) => {
  const result = await serverless(app)(event, context);

  return result;
};

export { hello };
