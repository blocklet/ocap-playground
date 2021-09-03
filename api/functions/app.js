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
const displayRoutes = require('express-routemap');
const Notification = require('@blocklet/sdk/service/notification');

const { walletHandlers, walletHandlersWithNoChainInfo, agentHandlers } = require('../libs/auth');

const isDev = process.env.NODE_ENV === 'development';

// Create and config express application

const app = express();
const server = http.createServer(app);

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

// TODO: cleanup this, because this is an experimental feature that send request through socket
const onStart = ({ req, deepLink }) => {
  if (req.user && req.user.did) {
    Notification.sendToUser(req.user.did, {
      title: 'DIDConnect',
      body: deepLink,
    }).catch(err => console.error(err));
  }
};

// Currency
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/receive-token')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/send-token')));

// No ChainInfo
walletHandlersWithNoChainInfo.attach(
  Object.assign({ app: router, onStart }, require('../routes/auth/claim-profile-no-chain-info'))
);

walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-profile')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-signature')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-create-did')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-target')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-overwrite')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-multiple')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-multiple-step')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-multiple-workflow')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/error')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/timeout')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/transfer-asset-out')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/transfer-asset-in')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/transfer-token-asset-in')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/transfer-token-asset-out')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/acquire-asset')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/exchange-asset')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/swap-asset')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/swap-token')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/fake-issuer-vc')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/fake-email-vc')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/consume-vc')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/issue-badge')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/issue-badge-asset')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/extra-params')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/delegate')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/launch-node')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/verify-nft')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/nft-private-action')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/nft-private-status')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/prepare')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/fake-passport')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-target-vc')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/launch-service')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/stake')));
walletHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/revoke-stake')));

agentHandlers.attach(Object.assign({ app: router, onStart }, require('../routes/auth/claim-profile'))); // we can reuse something here

require('../routes/session').init(router);
require('../routes/nft').init(router);
require('../routes/authorizations').init(router);
require('../routes/notification').init(router);

if (isDev) {
  app.use(router);
} else {
  app.use(compression());
  app.use(router);

  if (process.env.PRINT_ROUTES) {
    displayRoutes(app);
  }

  const staticDir = path.resolve(__dirname, '../../', 'build');
  app.use(express.static(staticDir, { maxAge: '365d', index: false }));
  app.use(fallback('index.html', { root: staticDir }));

  app.use((req, res) => {
    res.status(404).send('404 NOT FOUND');
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
}

exports.server = server;
