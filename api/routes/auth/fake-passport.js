/* eslint-disable no-console */
const { fromPublicKey } = require('@ocap/wallet');
const { toTypeInfo } = require('@arcblock/did');
const { create } = require('@arcblock/vc');

const { wallet } = require('../../libs/auth');
const { getRandomMessage } = require('../../libs/util');
const createPassportSvg = require('../../libs/nft/passport');
const { User } = require('../../models');

module.exports = {
  action: 'fake_passport',
  claims: {
    signature: () => ({
      description: 'Please sign the text to claim fake passport',
      data: getRandomMessage(),
      type: 'mime:text/plain',
    }),
  },

  onAuth: async ({ userDid, userPk, claims, sessionDid }) => {
    const type = toTypeInfo(userDid);
    const user = fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');

    logger.info('claim.fakePassport.onAuth', { userPk, userDid, claim });

    if (claim.origin) {
      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('Origin 签名错误');
      }
    }

    const passport = { name: 'arcblocker', title: 'ArcBlocker' };
    const vc = create({
      type: ['PlaygroundFakePassport', 'NFTPassport', 'VerifiableCredential'],
      issuer: {
        wallet,
        name: 'Wallet Playground',
      },
      subject: {
        id: userDid,
        passport,
        time: Date.now(),
        display: {
          type: 'svg',
          passport,
          content: createPassportSvg({
            issuer: 'Wallet Playground',
            issuerDid: wallet.address,
            title: passport.title,
          }),
        },
      },
    });
    const sessionUser = await User.ensureOne({ did: sessionDid });
    sessionUser.extraVC = vc.id;
    await User.update(sessionUser);
    return {
      disposition: 'attachment',
      type: 'VerifiableCredential',
      data: vc,
    };
  },
};
