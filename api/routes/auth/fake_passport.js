/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromJSON } = require('@ocap/wallet');
const { toTypeInfo } = require('@arcblock/did');
const { create } = require('@arcblock/vc');

const { wallet } = require('../../libs/auth');
const { getRandomMessage } = require('../../libs/util');
const createPassportSvg = require('../../libs/nft/passport');

module.exports = {
  action: 'fake_passport',
  claims: {
    signature: () => ({
      description: 'Please sign the text to claim fake passport',
      data: getRandomMessage(),
      type: 'mime:text/plain',
    }),
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    const type = toTypeInfo(userDid);
    const user = SDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');

    logger.info('claim.fakePassport.onAuth', { userPk, userDid, claim });

    if (claim.origin) {
      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('Origin 签名错误');
      }
    }

    const app = fromJSON(wallet);
    const passport = { name: 'arcblocker', title: 'ArcBlocker' };
    const vc = create({
      type: ['PlaygroundFakePassport', 'NFTPassport', 'VerifiableCredential'],
      issuer: {
        wallet: app,
        name: 'Wallet Playground',
      },
      subject: {
        id: userDid,
        display: {
          type: 'svg',
          passport,
          content: createPassportSvg({
            issuer: 'Wallet Playground',
            issuerDid: app.toAddress(),
            title: passport.title,
          }),
        },
      },
    });

    return {
      disposition: 'attachment',
      type: 'VerifiableCredential',
      data: vc,
    };
  },
};
