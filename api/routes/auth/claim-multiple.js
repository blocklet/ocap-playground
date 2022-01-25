const { fromTokenToUnit } = require('@ocap/util');
const { getRandomMessage } = require('../../libs/util');

const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'claim_multiple',
  claims: {
    signTx: [
      'signature',
      async () => ({
        type: 'TransferV2Tx',
        data: {
          itx: {
            to: wallet.address,
            tokens: [
              {
                address: env.localTokenId,
                value: fromTokenToUnit(1, 18).toString(),
              },
            ],
          },
        },
        description: 'Please sign the transaction, you will send 1 token',
      }),
    ],
    signText: [
      'signature',
      () => ({
        type: 'mime:text/plain',
        data: getRandomMessage(),
        description: 'Please sign the text',
      }),
    ],
    signHtml: [
      'signature',
      ({ userDid, userPk }) => ({
        type: 'mime:text/html',
        data: `<div>
  <h2>This is title</h2>
  <ul>
    <li>UserDid: ${userDid}</li>
    <li>UserPk: ${userPk}</li>
    <li>Random: ${Math.random()}</li>
  </ul>
</div>`,
        description: 'Please sign the html',
      }),
    ],
  },

  onAuth: async ({ userDid, userPk, claims, step }) => {
    logger.info('claim.multiStep.onAuth', { step, userPk, userDid, claims });
  },
};
