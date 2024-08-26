/* eslint-disable no-console */
const path = require('path');
const Client = require('@ocap/client');
const Jwt = require('@arcblock/jwt');
const JWT = require('jsonwebtoken');
const AuthNedbStorage = require('@arcblock/did-auth-storage-nedb');
const WalletAuthenticator = require('@blocklet/sdk/lib/wallet-authenticator');
const WalletHandlers = require('@blocklet/sdk/lib/wallet-handler');
const getWallet = require('@blocklet/sdk/lib/wallet');
const AuthService = require('@blocklet/sdk/service/auth');
const { NFTFactory } = require('@arcblock/nft');
const { fromSecretKey } = require('@ocap/wallet');
const { types, Hasher } = require('@ocap/mcrypto');
const { toDid } = require('@ocap/util');

const env = require('./env');

const wallet = getWallet();
const client = new Client(env.chainHost);

const getDelegator = () =>
  process.env.DELEGATOR_APP_SK
    ? fromSecretKey(process.env.DELEGATOR_APP_SK, { role: types.RoleType.ROLE_APPLICATION })
    : null;

const walletAuth = new WalletAuthenticator({
  delegator: ({ request }) => {
    if (!request.context?.store) {
      return null;
    }

    const delegator = getDelegator();
    const { extraParams } = request.context.store;
    if (extraParams.delegated && delegator) {
      return delegator;
    }

    return null;
  },
  delegation: ({ request }) => {
    if (!request.context?.store) {
      return null;
    }

    const delegator = getDelegator();
    const { extraParams } = request.context.store;
    if (extraParams.delegated && delegator) {
      return Jwt.signV2(delegator.address, delegator.secretKey, {
        agentDid: toDid(wallet.address),
        permissions: [
          {
            role: 'DIDConnectAgent',
            claims: [
              'authPrincipal',
              'profile',
              'signature',
              'prepareTx',
              'agreement',
              'verifiableCredential',
              'asset',
              'keyPair',
              'encryptionKey',
            ],
          },
        ],
        exp: Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 365,
      });
    }

    return null;
  },
});

const walletAuthWithNoChainInfo = new WalletAuthenticator({
  chainInfo: { host: 'none', id: 'none', restrictedDeclare: false },
});

const dbOnload = (err, dbName) => {
  if (err) {
    console.error(`Failed to load database from ${path.join(process.env.BLOCKLET_DATA_DIR || './', dbName)}`, err);
  }
};

const tokenStorage = new AuthNedbStorage({
  dbPath: path.join(process.env.BLOCKLET_DATA_DIR || './', 'auth.db'),
  onload: err => {
    dbOnload(err, 'auth.db');
  },
});

const walletHandlers = new WalletHandlers({
  authenticator: walletAuth,
  tokenStorage,
  onConnect: args => {
    const { userDid, extraParams, forceConnected } = args;
    if (['claim_create_did', 'delegate', 'claim_target'].includes(extraParams.action)) {
      return;
    }

    if (!forceConnected) {
      return;
    }

    if (userDid && extraParams.connectedDid && userDid !== extraParams.connectedDid) {
      throw new Error('你可能使用了多个不同的钱包来和本应用交互，请使用当前登录的钱包交互');
    }
  },
});
const walletHandlersWithNoChainInfo = new WalletHandlers({
  authenticator: walletAuthWithNoChainInfo,
  tokenStorage,
  options: {
    enforceChallenge: true,
  },
});

const factory = new NFTFactory({
  chainId: env.chainId,
  chainHost: env.chainHost,
  wallet,
  issuer: {
    name: env.appName,
    url: env.appUrl,
    logo: 'https://releases.arcblockio.cn/dapps/labs.png',
  },
});

const createLoginToken = ({ did, role = 'guest', expiresIn = '7d' }) => {
  const secret = Hasher.SHA3.hash256(Buffer.concat([wallet.secretKey, wallet.address].map(v => Buffer.from(v))));
  const payload = {
    type: 'user',
    did,
    role,
  };

  const token = JWT.sign(payload, secret, { expiresIn });
  return token;
};

module.exports = {
  tokenStorage,

  walletHandlers,
  walletHandlersWithNoChainInfo,

  wallet,
  client,
  factory,

  authClient: new AuthService(),

  createLoginToken,
};
