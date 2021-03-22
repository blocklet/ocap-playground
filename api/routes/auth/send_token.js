/* eslint-disable no-console */
const ForgeSDK = require('@ocap/sdk');
const { fromTokenToUnit } = require('@ocap/util');
const { fromAddress } = require('@ocap/wallet');
const { wallet } = require('../../libs/auth');
const { getTokenInfo } = require('../../libs/util');
const env = require('../../libs/env');

module.exports = {
  action: 'send_token',
  authPrincipal: false,
  claims: [
    {
      authPrincipal: async ({ extraParams: { chain } }) => ({
        description: 'Please select the required DID',
        chainInfo: {
          host: chain === 'local' ? env.chainHost : env.chainHost,
          id: chain === 'local' ? env.chainId : env.chainId,
        },
      }),
    },
    {
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

        return {
          type: 'TransferTx',
          data: {
            itx: {
              to: wallet.address,
              value: fromTokenToUnit(amount, token[chain].decimal),
            },
          },
          description: description[locale] || description.en,
          chainInfo: {
            host: chain === 'local' ? env.chainHost : env.chainHost,
            id: chain === 'local' ? env.chainId : env.chainId,
          },
        };
      },
    },
  ],
  onAuth: async ({ claims, userDid, extraParams: { locale, chain } }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      const tx = ForgeSDK.decodeTx(claim.origin);
      const user = fromAddress(userDid);

      const hash = await ForgeSDK.sendTransferTx(
        {
          tx,
          wallet: user,
          signature: claim.sig,
        },
        { conn: chain === 'local' ? env.chainId : env.chainId }
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
