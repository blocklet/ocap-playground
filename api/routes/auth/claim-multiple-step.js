const { fromTokenToUnit } = require('@ocap/util');
const { getRandomMessage } = require('../../libs/util');

const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'claim_multiple_step',
  claims: [
    {
      signature: async () => ({
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
    },
    {
      signature: () => ({
        type: 'mime:text/plain',
        data: getRandomMessage(),
        description: 'Please sign the text',
      }),
    },
    {
      signature: async ({ userDid, userPk }) => ({
        type: 'mime:text/html',
        data: `<div>
  <h2 style="color:red;font-weight:bold;border-bottom:1px solid blue;">This is title</h2>
  <ul>
    <li>userDid: ${userDid}</li>
    <li>userPk: ${userPk}</li>
  </ul>
</div>`,
        description: 'Please sign the html',
      }),
    },
  ],

  onAuth: async ({ userDid, userPk, claims, step }) => {
    logger.info('claim.multiStep.onAuth', { step, userPk, userDid, claims });
  },
};
