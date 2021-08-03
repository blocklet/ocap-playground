/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const ForgeWallet = require('@ocap/wallet');
const { create } = require('@arcblock/vc');
const { toTypeInfo } = require('@arcblock/did');

const { wallet } = require('../../libs/auth');
const { getRandomMessage } = require('../../libs/util');

const badgeArray = require('../../libs/svg');

module.exports = {
  action: 'issue_badge',
  claims: {
    signature: () => {
      const index = Math.floor(Math.random() * 10 + 1);
      return {
        description: '签名该文本，你将获得如下徽章',
        data: getRandomMessage(),
        type: 'mime:text/plain',
        meta: { index },
        display: JSON.stringify({
          type: 'svg_gzipped',
          content: badgeArray[index % 10],
        }),
      };
    },
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    const type = toTypeInfo(userDid);
    const user = SDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');
    if (user.verify(claim.origin, claim.sig) === false) {
      throw new Error('签名错误');
    }

    const svg = badgeArray[claim.meta.index];
    const w = ForgeWallet.fromJSON(wallet);

    const vc = create({
      type: ['NFTBadge', 'VerifiableCredential'],
      issuer: {
        wallet: w,
        name: 'ArcBlock.Badge',
      },
      subject: {
        id: userDid,
        name: 'Wallet Playground Completion',
        description: 'Master of Cross Border Money Transfer',
        display: {
          type: 'svg_gzipped',
          content: svg,
        },
      },
    });

    return {
      disposition: 'attachment',
      type: 'VerifiableCredential',
      data: vc,
      tag: `badge-${claim.meta.index}`,
    };
  },
};
