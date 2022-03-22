module.exports = {
  action: 'connect-only',
  onAuth: async ({ userDid }) => {
    return { successMessage: `You are connected ${userDid}` };
  },
};
