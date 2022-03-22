/* eslint-disable no-console */
module.exports = {
  action: 'connect-optional-vc',
  onConnect: () => {
    return {
      verifiableCredential: () => {
        return {
          description: 'Please provide passport from staging server',
          item: ['ABTNodePassport'],
          trustedIssuers: ['zNKjT5VBGNEzh4p6V4dsaYE61e7Pxxn3vk4j'],
          optional: true,
        };
      },
    };
  },

  onAuth: async ({ userDid, claims }) => {
    console.log('provided', userDid, claims);
  },
};
