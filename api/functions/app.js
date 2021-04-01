/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
const path = require('path');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fallback = require('express-history-api-fallback');
const compression = require('compression');
const logger = require('../libs/logger');

const { walletHandlers, walletHandlersWithNoChainInfo, agentHandlers } = require('../libs/auth');

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.BLOCKLET_APP_ID;

// Create and config express application

const app = express();
const server = http.createServer(app);
logger.initialize(app);

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
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/acquire_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/exchange_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap_token')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/fake_issuer_vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/fake_email_vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/consume_vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/issue_badge')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/issue_badge_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/extra_params')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/delegate')));

agentHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim_profile'))); // we can reuse something here

require('../routes/session').init(router);
require('../routes/nft').init(router);
require('../routes/authorizations').init(router);

if (isProduction) {
  app.use(compression());
  app.use(router);
  if (process.env.BLOCKLET_DID) {
    app.use(`/${process.env.BLOCKLET_DID}`, router);
  }

  const staticDir = path.resolve(__dirname, '../../', 'build');
  app.use(express.static(staticDir, { maxAge: '365d', index: false }));
  if (process.env.BLOCKLET_DID) {
    app.use(`/${process.env.BLOCKLET_DID}`, express.static(staticDir, { maxAge: '365d', index: false }));
  }
  app.use(fallback('index.html', { root: staticDir }));

  app.use((req, res) => {
    res.status(404).send('404 NOT FOUND');
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
} else {
  app.use(router);
}

exports.server = server;
