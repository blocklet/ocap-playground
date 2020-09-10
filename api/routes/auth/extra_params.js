/* eslint-disable no-console */
const params = {
  string: 'string',
  object: { key: 'value' },
  number: 1234,
  boolean: true,
  array: ['abcd', '1234', 'ABCD'],
};

module.exports = {
  action: 'extra_params',
  claims: {
    profile: ({ extraParams }) => {
      logger.info('extraParams', extraParams);
      if (extraParams.string !== params.string) {
        throw new Error('Your wallet is not handling string params correctly');
      }
      if (Number(extraParams.number) !== Number(params.number)) {
        throw new Error('Your wallet is not handling number params correctly');
      }
      if (JSON.parse(extraParams.boolean) !== params.boolean) {
        throw new Error('Your wallet is not handling boolean params correctly');
      }
      if (JSON.stringify(extraParams.array) !== JSON.stringify(params.array)) {
        throw new Error('Your wallet is not handling array params correctly');
      }
      // if (extraParams.object !== params.object) {
      //   throw new Error('Your wallet is not handling object params correctly');
      // }

      return {
        description: 'Please provide your email',
        fields: ['email'],
      };
    },
  },

  onAuth: () => {},
};
