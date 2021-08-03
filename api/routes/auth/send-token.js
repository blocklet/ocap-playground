/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromTokenToUnit } = require('@ocap/util');
const { fromAddress } = require('@ocap/wallet');

const { wallet } = require('../../libs/auth');
const { getTokenInfo } = require('../../libs/util');
const env = require('../../libs/env');

module.exports = {
  action: 'send_token',
  claims: {
    signature: async ({ extraParams: { locale, chain, amount } }) => {
      const token = await getTokenInfo();
      if (amount === 'random') {
        // eslint-disable-next-line no-param-reassign
        amount = (Math.random() * 10).toFixed(6);
      }

      if (!Number(amount)) {
        throw new Error('Invalid amount param for send token playground action');
      }

      const description = {
        en: `Please pay ${amount} ${token[chain].symbol} to application`,
        zh: `请支付 ${amount} ${token[chain].symbol}`,
      };

      const tokens = [
        {
          address: env.tokenId,
          value: fromTokenToUnit(chain === 'local' ? 0 : amount, token[chain].decimal).toString(),
        },
      ];

      return {
        type: 'TransferV2Tx',
        data: {
          itx: {
            to: wallet.address,
            value: fromTokenToUnit(chain === 'local' ? amount : 0, token[chain].decimal),
            tokens: chain === 'local' ? [] : tokens,
          },
        },
        description: description[locale] || description.en,
      };
    },
  },
  onAuth: async ({ claims, userDid, extraParams: { locale } }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      const tx = SDK.decodeTx(claim.origin);
      const user = fromAddress(userDid);

      const hash = await SDK.sendTransferV2Tx({
        tx,
        wallet: user,
        signature: claim.sig,
      });

      logger.info('send_token.onAuth', { claims, userDid, hash });
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info('send_token.onAuth.error', err);
      const errors = {
        en: 'Send token failed!',
        zh: '支付失败',
      };
      throw new Error(errors[locale] || errors.en);
    }
  },
};
