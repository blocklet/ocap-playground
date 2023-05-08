const env = require('../../libs/env');

/* eslint-disable no-console */
module.exports = {
  action: 'multi-chain',
  claims: [
    {
      authPrincipal: ({ extraParams: { type } }) => {
        if (type === 'arcblock') {
          return {
            description: 'Please sign in with your ArcBlock account',
            chainInfo: {
              host: env.chainHost,
              id: env.chainId,
            },
          };
        }

        if (type === 'ethereum') {
          return {
            description: 'Please sign in with your Ethereum account',
            chainInfo: {
              type: 'ethereum',
              id: '5',
            },
          };
        }

        throw new Error('Invalid chain type');
      },
    },
    {
      profile: () => {
        return {
          description: 'Please provide your email',
          fields: ['email'],
        };
      },
    },
  ],

  onAuth: ({ claims, userDid }) => {
    console.log(claims);
    return {
      successMessage: `Your selected account is ${userDid}`,
    };
  },
};
