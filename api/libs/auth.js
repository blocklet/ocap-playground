/* eslint-disable no-console */
const Mcrypto = require('@arcblock/mcrypto');
const ForgeSDK = require('@arcblock/forge-sdk');
const AuthNedbStorage = require('@arcblock/did-auth-storage-nedb');
const AgentNedbStorage = require('@arcblock/did-agent-storage-nedb');
const SwapNedbStorage = require('@arcblock/swap-storage-nedb');
const { NFTFactory } = require('@arcblock/nft');
const { fromSecretKey, fromJSON, WalletType } = require('@arcblock/forge-wallet');
const {
  WalletAuthenticator,
  AgentAuthenticator,
  WalletHandlers,
  SwapHandlers,
  AgentWalletHandlers,
} = require('@arcblock/did-auth');
const path = require('path');
const env = require('./env');

const type = WalletType({
  role: Mcrypto.types.RoleType.ROLE_APPLICATION,
  pk: Mcrypto.types.KeyType.ED25519,
  hash: Mcrypto.types.HashType.SHA3,
});

if (env.chainHost) {
  ForgeSDK.connect(env.chainHost, { chainId: env.chainId, name: env.chainId, default: true });
  console.log('Connected to chainHost', env.chainHost);
  if (env.assetChainHost) {
    ForgeSDK.connect(env.assetChainHost, { chainId: env.assetChainId, name: env.assetChainId });
    console.log('Connected to assetChainHost', env.assetChainHost);
  }
}

const wallet = fromSecretKey(process.env.APP_SK || process.env.BLOCKLET_APP_SK, type).toJSON();
const isRestricted = process.env.APP_RESTRICTED_DECLARE && JSON.parse(process.env.APP_RESTRICTED_DECLARE);

const icon = 'https://releases.arcblockio.cn/dapps/labs.png';
const walletAuth = new WalletAuthenticator({
  wallet,
  appInfo: ({ baseUrl }) => ({
    name: env.appName,
    description: env.appDescription,
    icon: env.appIcon || icon,
    link: baseUrl,
  }),
  chainInfo: ({ locale }) => {
    if (locale === 'zh' && env.chainHostZh) {
      return {
        host: env.chainHostZh,
        id: env.chainId,
        restrictedDeclare: isRestricted,
      };
    }

    return {
      host: env.chainHost,
      id: env.chainId,
      restrictedDeclare: isRestricted,
    };
  },
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
    restrictedDeclare: isRestricted,
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
const swapStorage = new SwapNedbStorage({
  dbPath: path.join(process.env.BLOCKLET_DATA_DIR || './', 'swap.db'),
  onload: err => {
    dbOnload(err, 'swap.db');
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

const swapHandlers = new SwapHandlers({
  authenticator: walletAuth,
  tokenStorage,
  swapStorage,
  swapContext: {
    offerChainId: env.chainId,
    offerChainHost: env.chainHost,
    demandChainId: env.assetChainId,
    demandChainHost: env.assetChainHost,
  },
  options: {
    swapKey: 'tid',
  },
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
  chainId: env.assetChainId,
  chainHost: env.assetChainHost,
  wallet: fromJSON(wallet),
  issuer: {
    name: 'ArcBlock',
    url: 'https://www.arcblock.io',
    logo: icon,
  },
});

module.exports = {
  tokenStorage,
  swapStorage,
  agentStorage,

  walletHandlers,
  walletHandlersWithNoChainInfo,
  swapHandlers,
  agentHandlers,

  wallet,
  localFactory,
  foreignFactory,
};
