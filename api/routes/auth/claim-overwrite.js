/* eslint-disable no-console */
const fakeChainInfo = {
  id: 'xenon-2020-01-15',
  host: 'http://47.104.23.85:8214/api',
};

module.exports = {
  action: 'claim_overwrite',
  authPrincipal: {
    chainInfo: fakeChainInfo,
  },
  claims: {
    profile: async () => ({
      description: 'Please provide your full profile',
      fields: ['fullName', 'email', 'phone'],
      chainInfo: fakeChainInfo,
    }),
  },

  onAuth: async ({ userDid, userPk }) => {
    logger.info('auth.onAuth', { userPk, userDid });
  },
};
