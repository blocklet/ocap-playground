/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
// require('../libs/contracts/create_movie_ticket_contract/.compiled/create_movie_ticket/javascript/index');
const path = require('path');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const serverless = require('serverless-http');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fallback = require('express-history-api-fallback');
const compression = require('compression');
const EventServer = require('@arcblock/event-server');
const logger = require('../libs/logger');

// ------------------------------------------------------------------------------
// Routes: due to limitations of netlify functions, we need to import routes here
// ------------------------------------------------------------------------------
const { walletHandlers, walletHandlersWithNoChainInfo, swapHandlers, agentHandlers } = require('../libs/auth');

const netlifyPrefix = '/.netlify/functions/app';
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.BLOCKLET_APP_ID;
const isNetlify = process.env.NETLIFY && JSON.parse(process.env.NETLIFY);

// Create and config express application

const app = express();
const server = http.createServer(app);
logger.initialize(app);
// Only enable socket server in production, since live reload will also have socket server
if (isProduction && !isNetlify) {
  const eventServer = new EventServer(server, ['auth']);
  walletHandlers.on('scanned', data => data && eventServer.dispatch('auth', data));
  walletHandlers.on('succeed', data => data && eventServer.dispatch('auth', data));
  walletHandlers.on('failed', data => data && eventServer.dispatch('auth', data));
}

app.set('trust proxy', true);
app.use(cookieParser());
app.use(bodyParser.json({ limit: '1 mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1 mb' }));
app.use(cors());

app.use(
  morgan((tokens, req, res) => {
    const log = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');

    if (isProduction) {
      // Log only in AWS context to get back function logs
      console.log(log);
    }

    return log;
  })
);

app.use((req, res, next) => {
  if (req.headers['x-user-did']) {
    req.user = {
      did: req.headers['x-user-did'],
    };
  }

  next();
});

const router = express.Router();

// Currency
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/receive_token')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/send_token')));
swapHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap_token')));

// Assets
swapHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap_asset')));
// No ChainInfo
walletHandlersWithNoChainInfo.attach(
  Object.assign({ app: router }, require('../routes/auth/claim_profile_no_chain_info'))
);

walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim_profile')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim_signature')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim_create_did')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim_target')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim_overwrite')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim_multiple')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim_multiple_step')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/error')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/timeout')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer_asset_out')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer_asset_in')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer_token_asset_in')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer_token_asset_out')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/consume_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/acquire_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/exchange_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/fake_issuer_vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/fake_email_vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/consume_vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/issue_badge')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/issue_badge_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/extra_params')));
swapHandlers.attach(Object.assign({ app: router }, require('../routes/auth/pickup_swap')));
agentHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim_profile'))); // we can reuse something here
require('../routes/session').init(router);
require('../routes/authorizations').init(router);
require('../routes/orders').init(router);
require('../routes/charge').init(router);
require('../routes/assets').init(router);

if (isProduction) {
  app.use(compression());
  if (isNetlify) {
    app.use(netlifyPrefix, router);
  } else {
    app.use(router);
    if (process.env.BLOCKLET_DID) {
      app.use(`/${process.env.BLOCKLET_DID}`, router);
    }

    const staticDir = process.env.BLOCKLET_APP_ID ? './' : '../../';
    const staticDirNew = path.resolve(__dirname, staticDir, 'build');
    app.use(express.static(staticDirNew, { maxAge: '365d', index: false }));
    if (process.env.BLOCKLET_DID) {
      app.use(`/${process.env.BLOCKLET_DID}`, express.static(staticDirNew, { maxAge: '365d', index: false }));
    }
    app.use(fallback('index.html', { root: staticDirNew }));
  }

  app.use((req, res) => {
    res.status(404).send('404 NOT FOUND');
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
} else if (isNetlify) {
  app.use(netlifyPrefix, router);
} else {
  app.use(router);
}

// Make it serverless
exports.handler = serverless(app);
exports.server = server;
