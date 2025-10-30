const { env } = require('@blocklet/sdk/lib/env');

module.exports = {
  ...env,
  chainId: 'playground',
  chainHost: process.env.CHAIN_HOST || '',
  localTokenId: process.env.LOCAL_TOKEN_ID || '',
  foreignTokenId: process.env.FOREIGN_TOKEN_ID || '',
  apiPrefix: process.env.API_PREFIX || '',
};
