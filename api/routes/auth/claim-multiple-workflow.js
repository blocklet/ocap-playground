const axios = require('axios');
const env = require('../../libs/env');

module.exports = {
  action: 'claim_multiple_workflow',
  claims: {
    profile: () => ({
      description: 'Please provide your full profile',
      fields: ['email'],
    }),
  },

  onAuth: async ({ extraParams: { locale } }) => {
    const { data } = await axios.get(
      `${env.appUrl}/api/did/receive_token/token?locale=${locale}&chain=local&amount=random`
    );
    return { nextWorkflow: data.url };
  },
};
