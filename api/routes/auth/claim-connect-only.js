module.exports = {
  action: 'connect-only',
  authPrincipal: false,
  claims: {
    authPrincipal: {
      description: 'Connect your DID Wallet to continue',
      supervised: true,
    },
  },
  onAuth: async ({ userDid }) => {
    return { successMessage: `You are connected ${userDid}` };
  },
};
