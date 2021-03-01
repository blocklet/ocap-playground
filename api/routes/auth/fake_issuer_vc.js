const ForgeSDK = require('@arcblock/forge-sdk');
const ForgeWallet = require('@arcblock/forge-wallet');
const Mcrypto = require('@arcblock/mcrypto');
const { toTypeInfo } = require('@arcblock/did');
const { create } = require('@arcblock/vc');

const { getRandomMessage } = require('../../libs/util');
const { authClient } = require('../../libs/auth');

const hasher = Mcrypto.getHasher(Mcrypto.types.HashType.SHA3);

module.exports = {
  action: 'fake_issuer_vc',
  claims: {
    signature: () => ({
      description: 'Please sign the text to claim verifiable credential',
      data: getRandomMessage(),
      type: 'mime:text/plain',
    }),
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    const type = toTypeInfo(userDid);
    const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');

    logger.info('claim.signature.onAuth', { userPk, userDid, claim });

    if (claim.origin) {
      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('Origin 签名错误');
      }
    }

    const { user: vt } = await authClient.getUser(userDid);

    const w = ForgeWallet.fromRandom();
    const emailDigest = hasher(vt.email, 1);
    const vc = create({
      type: 'EmailVerificationCredential',
      issuer: {
        wallet: w,
        name: 'ArcBlock.KYC.Email',
      },
      subject: {
        id: userDid,
        emailDigest: ForgeSDK.Util.toBase64(emailDigest),
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
