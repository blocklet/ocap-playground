/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const ForgeWallet = require('@ocap/wallet');
const Mcrypto = require('@ocap/mcrypto');
const { toTypeInfo } = require('@arcblock/did');
const { create } = require('@arcblock/vc');

const { wallet } = require('../../libs/auth');
const { getRandomMessage } = require('../../libs/util');
const { User } = require('../../models');

const hasher = Mcrypto.getHasher(Mcrypto.types.HashType.SHA3);

module.exports = {
  action: 'issue_email_vc',
  claims: {
    signature: () => ({
      description: 'Please sign the text to claim verifiable credential',
      data: getRandomMessage(),
      type: 'mime:text/plain',
    }),
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    const type = toTypeInfo(userDid);
    const user = SDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');

    logger.info('claim.signature.onAuth', { userPk, userDid, claim });

    if (claim.origin) {
      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('Origin 签名错误');
      }
    }

    const vt = await User.findOne({ did: userDid });
    if (vt.emailVerified === false) {
      throw new Error('没有验证过邮箱');
    }
    const w = ForgeWallet.fromJSON(wallet);
    const emailDigest = hasher(vt.email, 1);
    const vc = create({
      type: 'EmailVerificationCredential',
      issuer: {
        wallet: w,
        name: 'ArcBlock.KYC.Email',
      },
      subject: {
        id: userDid,
        emailDigest: SDK.Util.toBase64(emailDigest),
        method: 'SHA3',
      },
    });
    return {
      disposition: 'attachment',
      type: 'VerifiableCredential',
      data: vc,
      tag: vt.email,
    };
  },
};
