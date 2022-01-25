module.exports = {
  chainId: 'playground',
  chainHost: process.env.CHAIN_HOST || '',
  localTokenId: process.env.LOCAL_TOKEN_ID || '',
  foreignTokenId: process.env.FOREIGN_TOKEN_ID || '',
  appUrl: process.env.BLOCKLET_APP_URL || '',
  appId: process.env.BLOCKLET_APP_ID || '',
  appName: process.env.REACT_APP_APP_NAME || 'OCAP Playground',
  appDescription:
    process.env.APP_DESCRIPTION || 'Sample application shows what you can build upon ArcBlock technologies',
  apiPrefix: process.env.API_PREFIX || '',
};
