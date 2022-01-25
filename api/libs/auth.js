/* eslint-disable no-console */
const path = require('path');
const Mcrypto = require('@ocap/mcrypto');
const Client = require('@ocap/client');
const AuthNedbStorage = require('@arcblock/did-auth-storage-nedb');
const AgentNedbStorage = require('@arcblock/did-agent-storage-nedb');
const WalletAuthenticator = require('@blocklet/sdk/lib/wallet-authenticator');
const WalletHandlers = require('@blocklet/sdk/lib/wallet-handler');
const AuthService = require('@blocklet/sdk/service/auth');
const { NFTFactory } = require('@arcblock/nft');
const { fromSecretKey, WalletType } = require('@ocap/wallet');
const { AgentAuthenticator, AgentWalletHandlers } = require('@arcblock/did-auth');
const env = require('./env');

const type = WalletType({
  role: Mcrypto.types.RoleType.ROLE_APPLICATION,
  pk: Mcrypto.types.KeyType.ED25519,
  hash: Mcrypto.types.HashType.SHA3,
});

const wallet = fromSecretKey(process.env.BLOCKLET_APP_SK, type);
const client = new Client(env.chainHost);

const walletAuth = new WalletAuthenticator();

const walletAuthWithNoChainInfo = new WalletAuthenticator({
  chainInfo: { host: 'none', id: 'none', restrictedDeclare: false },
});

const agentAuth = new AgentAuthenticator({
  wallet: wallet.toJSON(),
  appInfo: ({ baseUrl }) => ({
    name: 'Agent Service',
    description: 'This is a demo agent service that can do did-auth on be-half-of another application',
    icon: env.appIcon,
    link: baseUrl,
  }),
  chainInfo: {
    host: env.chainHost,
    id: env.chainId,
  },
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
const agentStorage = new AgentNedbStorage({
  dbPath: path.join(process.env.BLOCKLET_DATA_DIR || './', 'agent.db'),
  onload: err => {
    dbOnload(err, 'agent.db');
  },
});

const walletHandlers = new WalletHandlers({
  authenticator: walletAuth,
  tokenStorage,
});
const walletHandlersWithNoChainInfo = new WalletHandlers({
  authenticator: walletAuthWithNoChainInfo,
  tokenStorage,
});

const agentHandlers = new AgentWalletHandlers({
  authenticator: agentAuth,
  tokenStorage,
  agentStorage,
});

const factory = new NFTFactory({
  chainId: env.chainId,
  chainHost: env.chainHost,
  wallet: wallet.toJSON(),
  issuer: {
    name: 'ArcBlock',
    url: 'https://www.arcblock.io',
    logo: 'https://releases.arcblockio.cn/dapps/labs.png',
  },
});

module.exports = {
  tokenStorage,
  agentStorage,

  walletHandlers,
  walletHandlersWithNoChainInfo,
  agentHandlers,

  wallet,
  client,
  factory,

  authClient: new AuthService(),
};
