import process from 'process';

import app from './app';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await app.listen(PORT, HOST);

    app.log.info(`app running on ${HOST}:${PORT}/`);
  } catch (err) {
    app.log.error(err);

    process.exit(1);
  }
};

start();
