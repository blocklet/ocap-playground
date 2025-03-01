const { toTypeInfo } = require('@arcblock/did');
const { fromPublicKey } = require('@ocap/wallet');

const { wallet, client } = require('../../libs/auth');
const { getTokenInfo, getRandomMessage } = require('../../libs/util');
const env = require('../../libs/env');

const messages = {
  amountInvalid: {
    en: 'Invalid amount param for receive token playground action',
    zh: 'amount 参数不正确',
  },
  signatureInvalid: {
    en: 'Signature invalid',
    zh: 'signature 参数不正确',
  },
};

module.exports = {
  action: 'receive_token',
  claims: {
    signature: async ({ extraParams: { locale, chain, amount } }) => {
      const token = await getTokenInfo();
      const description = {
        en: `Sign following text to get ${amount} ${token[chain].symbol} for test`,
        zh: `签名如下随机串，以获得测试用的 ${token[chain].symbol}`,
      };

      const random = getRandomMessage();

      return {
        description: description[locale],
        data: random,
        type: 'mime:text/plain',
      };
    },
  },

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ userDid, userPk, claims, extraParams: { chain, locale, amount } }) => {
    if (amount === 'random') {
      // eslint-disable-next-line no-param-reassign
      amount = (Math.random() * 10).toFixed(6);
    }

    if (!Number(amount)) {
      throw new Error(messages.amountInvalid[locale]);
    }

    try {
      const type = toTypeInfo(userDid);
      const user = fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if ((await user.verify(claim.origin, claim.sig)) === false) {
        throw new Error('要求的消息签名不正确');
      }

      const hash = await client.transfer({
        to: userDid,
        tokens: [{ address: chain === 'local' ? env.localTokenId : env.foreignTokenId, value: amount }],
        wallet,
      });
      logger.info('receive_token.onAuth', hash, amount);
      return { hash };
    } catch (err) {
      logger.error('receive_token.onAuth.error', err);
      throw new Error(`Receive token failed ${err.message}`);
    }
  },
};
