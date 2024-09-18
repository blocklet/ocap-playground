module.exports = {
  action: 'claim-empty',
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
