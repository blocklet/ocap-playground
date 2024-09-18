const { User } = require('../../models');

module.exports = {
  action: 'claim-no-ux',
  authPrincipal: false, // disable default auth principal
  claims: [
    {
      authPrincipal: async ({ extraParams: { sessionDid } }) => {
        return {
          description: 'Please select the required DID',
          target: sessionDid,
        };
      },
    },
  ],
  onAuth: async () => {},
};
