module.exports = {
  chainId:
    process.env.LOCAL_CHAIN_ID ||
    process.env.REACT_APP_CHAIN_ID ||
    process.env.GATSBY_CHAIN_ID ||
    process.env.CHAIN_ID ||
    process.env.chainId ||
    'local-chain',
  chainHost:
    process.env.LOCAL_CHAIN_HOST ||
    process.env.REACT_APP_CHAIN_HOST ||
    process.env.GATSBY_CHAIN_HOST ||
    process.env.CHAIN_HOST ||
    process.env.chainHost,
  chainHostZh:
    process.env.LOCAL_CHAIN_HOST_ZH ||
    process.env.REACT_APP_CHAIN_HOST_ZH ||
    process.env.GATSBY_CHAIN_HOST_ZH ||
    process.env.CHAIN_HOST_ZH ||
    process.env.chainHostZh,
  assetChainId:
    process.env.FOREIGN_CHAIN_ID ||
    process.env.REACT_APP_ASSET_CHAIN_ID ||
    process.env.GATSBY_ASSET_CHAIN_ID ||
    process.env.ASSET_CHAIN_ID ||
    process.env.assetChainId ||
    'foreign-chain',
  assetChainHost:
    process.env.FOREIGN_CHAIN_HOST ||
    process.env.REACT_APP_ASSET_CHAIN_HOST ||
    process.env.GATSBY_ASSET_CHAIN_HOST ||
    process.env.ASSET_CHAIN_HOST ||
    process.env.assetChainHost,
  assetChainHostZh:
    process.env.FOREIGN_CHAIN_HOST_ZH ||
    process.env.REACT_APP_ASSET_CHAIN_HOST_ZH ||
    process.env.GATSBY_ASSET_CHAIN_HOST_ZH ||
    process.env.ASSET_CHAIN_HOST_ZH ||
    process.env.assetChainHostZh,
  appId:
    process.env.REACT_APP_APP_ID ||
    process.env.GATSBY_APP_ID ||
    process.env.APP_ID ||
    process.env.BLOCKLET_APP_ID ||
    process.env.appId ||
    '',
  appName:
    process.env.REACT_APP_APP_NAME ||
    process.env.GATSBY_APP_NAME ||
    process.env.APP_NAME ||
    process.env.appName ||
    'Wallet Playground',
  appDescription:
    process.env.REACT_APP_APP_DESCRIPTION ||
    process.env.GATSBY_APP_DESCRIPTION ||
    process.env.APP_DESCRIPTION ||
    process.env.appDescription ||
    'Sample application shows what you can build upon ArcBlock technologies',
  baseUrl:
    process.env.REACT_APP_BASE_URL || process.env.GATSBY_BASE_URL || process.env.BASE_URL || '',
  apiPrefix:
    process.env.REACT_APP_API_PREFIX ||
    process.env.GATSBY_API_PREFIX ||
    process.env.NF_API_PREFIX ||
    process.env.API_PREFIX ||
    process.env.apiPrefix ||
    '',
};
