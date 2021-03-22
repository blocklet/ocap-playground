/* eslint-disable no-console */
const path = require('path');
const Mcrypto = require('@ocap/mcrypto');
const ForgeSDK = require('@ocap/sdk');
const AuthNedbStorage = require('@arcblock/did-auth-storage-nedb');
const AgentNedbStorage = require('@arcblock/did-agent-storage-nedb');
const { NFTFactory } = require('@arcblock/nft');
const { fromSecretKey, fromJSON, WalletType } = require('@ocap/wallet');
const { WalletAuthenticator, AgentAuthenticator, WalletHandlers, AgentWalletHandlers } = require('@arcblock/did-auth');
const AuthService = require('@blocklet/sdk/service/auth');
const env = require('./env');

const type = WalletType({
  role: Mcrypto.types.RoleType.ROLE_APPLICATION,
  pk: Mcrypto.types.KeyType.ED25519,
  hash: Mcrypto.types.HashType.SHA3,
});

if (env.chainHost) {
  ForgeSDK.connect(env.chainHost, { chainId: env.chainId, name: env.chainId, default: true });
  console.log('Connected to chainHost', env.chainHost);
  if (env.chainHost) {
    ForgeSDK.connect(env.chainHost, { chainId: env.chainId, name: env.chainId });
    console.log('Connected to chainHost', env.chainHost);
  }
}

const wallet = fromSecretKey(process.env.APP_SK || process.env.BLOCKLET_APP_SK, type).toJSON();

const icon = 'https://releases.arcblockio.cn/dapps/labs.png';
const walletAuth = new WalletAuthenticator({
  wallet,
  appInfo: ({ baseUrl }) => ({
    name: env.appName,
    description: env.appDescription,
    icon: env.appIcon || icon,
    link: baseUrl,
  }),
  chainInfo: () => ({
    host: env.chainHost,
    id: env.chainId,
  }),
});

const walletAuthWithNoChainInfo = new WalletAuthenticator({
  wallet,
  appInfo: ({ baseUrl }) => ({
    name: env.appName,
    description: env.appDescription,
    icon: env.appIcon || icon,
    link: baseUrl,
  }),
  chainInfo: { host: 'none', id: 'none', restrictedDeclare: false },
});

const agentAuth = new AgentAuthenticator({
  wallet,
  appInfo: ({ baseUrl }) => ({
    name: 'Agent Service',
    description: 'This is a demo agent service that can do did-auth on be-half-of another application',
    icon: env.appIcon || icon,
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

const localFactory = new NFTFactory({
  chainId: env.chainId,
  chainHost: env.chainHost,
  wallet: fromJSON(wallet),
  issuer: {
    name: 'ArcBlock',
    url: 'https://www.arcblock.io',
    logo: icon,
  },
});

const foreignFactory = new NFTFactory({
  chainId: env.chainId,
  chainHost: env.chainHost,
  wallet: fromJSON(wallet),
  issuer: {
    name: 'ArcBlock',
    url: 'https://www.arcblock.io',
    logo: icon,
  },
});

module.exports = {
  tokenStorage,
  agentStorage,

  walletHandlers,
  walletHandlersWithNoChainInfo,
  agentHandlers,

  wallet,
  localFactory,
  foreignFactory,

  authClient: new AuthService(),
};
