/* eslint-disable no-console */
import debug0 from 'debug';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { getAppInfo } from 'utilities';
import { Express } from 'express';
import app from '../app';

const debug = debug0('server:server');
const {
  SERVER_PORT,
  IS_DEVELOPMENT,
} = getAppInfo();

app.set('port', SERVER_PORT);

const getSslServer = () => {
  let httpsOptions;

  if (IS_DEVELOPMENT) {
    const webpackCert = fs.readFileSync(
      path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..', // project root
        'node_modules',
        'webpack-dev-server',
        'ssl',
        'server.pem',
      ),
    );
    httpsOptions = {
      key: webpackCert,
      cert: webpackCert,
    };
  } else {
    httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, 'privatekey.key')),
      cert: fs.readFileSync(path.join(__dirname, 'certificate.crt')),
    };
  }

  /**
   * Create HTTP server.
   */
  const sslServer = https.createServer(httpsOptions, app);
  return sslServer;
};

const listenServer = (serverListener: https.Server | Express) => {
  /**
   * Listen on provided SERVER_PORT, on all network interfaces.
   */

  serverListener.listen(SERVER_PORT, () => {
    console.log(`Our app is running on SERVER_PORT ${SERVER_PORT}`);
  });

  serverListener.on('error', onError);
  serverListener.on('listening', () => onListening(serverListener));
};

listenServer(getSslServer());


interface SystemError extends Error {
  syscall: string;
  code: string;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: SystemError) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = `Port ${SERVER_PORT}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    // eslint-disable-next-line no-fallthrough
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
    // eslint-disable-next-line no-fallthrough
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(listeningServer: https.Server | Express) {
  const addr = listeningServer instanceof https.Server ? listeningServer.address() : null;
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `SERVER_PORT ${addr?.port}`;
  debug(`Listening on ${bind}`);
  /* eslint-disable no-console */
  console.log(`Listening on ${bind}`);
  console.log(`Running on PID ${process.pid}`);
}

const terminateGracefully = () => {
  process.exit();
};

const terminationSignals = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;
terminationSignals.forEach((terminationSignal) => {
  process.on(terminationSignal, terminateGracefully);
});
