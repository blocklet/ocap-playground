module.exports = {
  chainId: process.env.CHAIN_ID || process.env.chainId || '',
  chainHost: process.env.CHAIN_HOST || process.env.chainHost || '',
  tokenId: process.env.TOKEN_ID || process.env.tokenId || '',
  appId: process.env.BLOCKLET_APP_ID || process.env.appId || '',
  appName: process.env.REACT_APP_APP_NAME || process.env.APP_NAME || process.env.appName || 'OCAP Playground',
  appDescription:
    process.env.APP_DESCRIPTION ||
    process.env.appDescription ||
    'Sample application shows what you can build upon ArcBlock technologies',
  baseUrl: process.env.REACT_APP_BASE_URL || process.env.GATSBY_BASE_URL || process.env.BASE_URL || '',
  apiPrefix: process.env.API_PREFIX || process.env.apiPrefix || '',
};
