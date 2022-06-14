const sleep = timeout =>
  new Promise(resolve => {
    setTimeout(resolve, timeout);
  });

module.exports = {
  action: 'timeout',
  claims: {
    profile: async ({ extraParams: { stage } }) => {
      logger.info('timeout.start', stage);

      if (stage === 'request') {
        await sleep(25000);
      }

      logger.info('timeout.end', stage);
      return {
        description: 'Please provide your full profile',
        fields: ['fullName', 'email'],
      };
    },
  },

  onAuth: async ({ extraParams: { stage } }) => {
    if (stage === 'response') {
      await sleep(25000);
    }
  },
};
