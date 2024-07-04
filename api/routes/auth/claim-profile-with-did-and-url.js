/* eslint-disable no-console */

const profileWithDidAndUrl = {
  action: 'profile-with-did-and-url',
  claims: {
    profile: async () => ({
      description: 'Please provide your profile',
      fields: ['did', 'fullName', 'email', 'url'],
    }),
  },

  onAuth: async ({ claims, userDid, userPk }) => {
    logger.info('profile-with-did-and-url.auth.onAuth', { userPk, userDid, claims });
  },
};

module.exports = profileWithDidAndUrl;
