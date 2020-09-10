/* eslint-disable no-console */
module.exports = {
  action: 'error',
  claims: {
    profile: async () => {
      throw new Error('this is the error message when composing the claim');
    },
  },

  onAuth: async () => {
    throw new Error('this is the error message when process auth response');
  },
};
