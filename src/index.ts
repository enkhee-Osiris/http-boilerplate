import serverless from 'serverless-http';
import { createApp } from './app';

import type { Handler } from 'aws-lambda';

const hello: Handler = async (event, context) => {
  const app = await createApp();

  const result = await serverless(app)(event, context);

  return result;
};

export { hello };
