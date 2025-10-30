require('express-async-errors');
const path = require('path');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { fallback } = require('@blocklet/sdk/lib/middlewares/fallback');
const { sessionMiddleware } = require('@blocklet/sdk/lib/middlewares/session');
const displayRoutes = require('express-routemap');

const { walletHandlers, walletHandlersWithNoChainInfo } = require('../libs/auth');

const isDev = process.env.NODE_ENV === 'development';

// Create and config express application

const app = express();
const server = http.createServer(app);

app.set('trust proxy', true);
app.use(cookieParser());
app.use(express.json({ limit: '1 mb' }));
app.use(express.urlencoded({ extended: true, limit: '1 mb' }));
app.use(cors());

app.use(sessionMiddleware());

const router = express.Router();

// Currency
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/receive-token')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/send-token')));

// No ChainInfo
walletHandlersWithNoChainInfo.attach(
  Object.assign({ app: router }, require('../routes/auth/claim-profile-no-chain-info'))
);

walletHandlersWithNoChainInfo.attach(
  Object.assign({ app: router }, require('../routes/auth/claim-profile-with-did-and-url'))
);

walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-profile')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-signature')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-create-did')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-target')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-overwrite')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-multiple')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-multiple-step')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-multiple-workflow')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/error')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/timeout')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer-asset-out')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer-asset-in')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer-token-asset-in')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer-token-asset-out')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/acquire-asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/exchange-asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap-asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap-token')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/fake-issuer-vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/fake-email-vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/consume-vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/issue-badge')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/issue-badge-asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/extra-params')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/delegate')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/delegation-limit')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/launch-node')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/verify-vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/verify-passport')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/vc-private-action')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/vc-private-status')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/nft-private-action')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/nft-private-status')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/prepare')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/fake-passport')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-target-vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/launch-service')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/restart-instance')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/stake')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/revoke-stake')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-stake')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/create')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/test-vc-claim-filter')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/test-nft-claim-filter')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/test-nft-or-vc-filter')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/test-nft-or-vc-filter-only-did-spaces')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-dynamic')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-connect-only')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-connect-optional-vc')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-no-connect')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/derive-key-pair')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/sign-delegation')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/decrypt-info')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/consume-asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/multi-chain')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-next-url')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/claim-empty')));

require('../routes/session').init(router);
require('../routes/nft').init(router);
require('../routes/notification').init(router);
require('../routes/stake').init(router);

if (isDev) {
  app.use(router);
} else {
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

      return log;
    })
  );
  app.use(compression());
  app.use(router);

  if (process.env.PRINT_ROUTES) {
    displayRoutes(app);
  }

  const staticDir = path.resolve(__dirname, '../../', 'dist');
  app.use(express.static(staticDir, { maxAge: '365d', index: false }));
  app.use(fallback('index.html', { root: staticDir, maxAge: 0 }));

  app.use((req, res) => {
    res.status(404).send('404 NOT FOUND');
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
}

module.exports = {
  server,
  app,
};
