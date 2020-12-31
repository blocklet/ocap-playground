/* eslint-disable no-console */
module.exports = {
  action: 'profile_no_chain_info',
  claims: {
    profile: async () => ({
      description: 'Please provide your profile',
      fields: ['fullName', 'email'],
    }),
  },

  onAuth: async ({ userDid, userPk }) => {
    logger.info('auth.onAuth', { userPk, userDid });
  },
};
