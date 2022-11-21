/* eslint-disable no-console */
const { fromTokenToUnit } = require('@ocap/util');
const { fromAddress } = require('@ocap/wallet');

const { wallet, client } = require('../../libs/auth');
const { getTokenInfo, pickGasPayerHeaders } = require('../../libs/util');
const env = require('../../libs/env');

module.exports = {
  action: 'send_token',
  claims: {
    signature: async ({ userDid, userPk, extraParams: { locale, chain, amount } }) => {
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

      return {
        type: 'TransferV2Tx',
        data: {
          from: userDid,
          pk: userPk,
          itx: {
            to: wallet.address,
            tokens: [
              {
                address: chain === 'local' ? env.localTokenId : env.foreignTokenId,
                value: fromTokenToUnit(amount, token[chain].decimal).toString(),
              },
            ],
          },
        },
        description: description[locale] || description.en,
      };
    },
  },
  onAuth: async ({ req, claims, userDid, extraParams: { locale } }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      const tx = client.decodeTx(claim.origin);
      const user = fromAddress(userDid);
      if (claim.from) {
        tx.from = claim.from;
      }
      if (claim.delegator) {
        tx.delegator = claim.delegator;
      }
      const hash = await client.sendTransferV2Tx(
        {
          tx,
          wallet: user,
          signature: claim.sig,
        },
        pickGasPayerHeaders(req)
      );

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
