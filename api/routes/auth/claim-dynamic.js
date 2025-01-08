const { toTypeInfo } = require('@arcblock/did');
const { fromPublicKey } = require('@ocap/wallet');

const { getRandomMessage } = require('../../libs/util');

module.exports = {
  action: 'dynamic-claims',
  onConnect: () => {
    return {
      signature: () => {
        const params = {
          type: 'mime:text/plain',
          data: getRandomMessage(),
        };

        return Object.assign({ description: 'Please sign the text to prove that you own the did' }, params);
      },
    };
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    const claim = claims.find(x => x.type === 'signature');
    const type = toTypeInfo(userDid);
    const w = fromPublicKey(userPk, type);
    if ((await w.verify(claim.origin, claim.sig)) === false) {
      throw new Error('签名错误');
    }
  },
};
