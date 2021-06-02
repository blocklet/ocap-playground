const SDK = require('@ocap/sdk');
const { verifyPresentation } = require('@arcblock/vc');
const { types, getHasher } = require('@ocap/mcrypto');
const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');
const { authClient } = require('../../libs/auth');

module.exports = {
  action: 'consume_vc',
  claims: {
    verifiableCredential: async ({ userDid, extraParams: { type, optional } }) => {
      const w = SDK.Wallet.fromJSON(wallet);
      const trustedIssuers = (
        env.trustedIssuers || 'zNKrLtPXN5ur9qMkwKWMYNzGi4D6XjWqTEjQ,zNKmbNePsqPGRNt5rc76eWzCVgYWDGuPMN7s'
      )
        .split(',')
        .concat(w.toAddress());
      let tag = '';
      if (type === 'EmailVerificationCredential') {
        const { user } = await authClient.getUser(userDid);
        tag = user.email;
      }

      return {
        description: 'Please provide your vc which proves your information',
        item: type,
        trustedIssuers,
        tag,
        optional: !!optional,
      };
    },
  },

  onAuth: async ({ userDid, claims, challenge, extraParams: { type, optional } }) => {
    const vcClaim = claims.find(x => x.type === 'verifiableCredential');

    if (!vcClaim) {
      if (!optional) {
        return;
      }
      throw new Error('Cannot get verifiable credential provided by wallet');
    }

    const presentation = JSON.parse(vcClaim.presentation);
    if (challenge !== presentation.challenge) {
      throw Error('unsafe response');
    }

    const vcArray = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential];

    const vc = JSON.parse(vcArray[0]);

    const expectedTypes = Array.isArray(type) ? type : [type];
    if (expectedTypes.every(x => vc.type !== x && vc.type.indexOf(x) === -1)) {
      throw Error('不是要求的VC类型');
    }

    if (type === 'EmailVerificationCredential') {
      const { user } = await authClient.getUser(userDid);
      const hasher = getHasher(types.HashType.SHA3);
      const digest = SDK.Util.toBase64(hasher(user.email, 1));
      if (vc.credentialSubject.emailDigest !== digest) {
        throw Error('VC 与您的邮箱不匹配');
      }
    }

    const w = SDK.Wallet.fromJSON(wallet);
    const trustedIssuers = (
      env.trustedIssuers || 'zNKrLtPXN5ur9qMkwKWMYNzGi4D6XjWqTEjQ,zNKmbNePsqPGRNt5rc76eWzCVgYWDGuPMN7s'
    )
      .split(',')
      .concat(w.toAddress());

    verifyPresentation({ presentation, trustedIssuers, challenge });
  },
};
