const env = require('../../libs/env');
const { createLoginToken } = require('../../libs/auth');

module.exports = {
  action: 'claim-next-url',
  claims: {
    profile: () => ({
      description: 'Please provide your email',
      fields: ['email'],
    }),
  },

  onAuth: async ({ userDid }) => {
    const token = createLoginToken({ did: userDid, role: 'guest' });
    return { nextUrl: env.appUrl, cookies: { login_token: token }, storages: { random: Math.random().toString() } };
  },
};
