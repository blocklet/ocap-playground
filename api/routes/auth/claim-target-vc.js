const { User } = require('../../models');

module.exports = {
  action: 'claim_target_vc',
  claims: {
    verifiableCredential: async ({ extraParams: { sessionDid } }) => {
      const user = await User.ensureOne({ did: sessionDid });
      if (!user) {
        throw new Error('You are not a valid user, please login and retry');
      }

      if (!user.extraVC) {
        throw new Error('You have not generated Fake Passport, please generate one first');
      }

      return {
        description: 'Please provide target VC',
        target: user.extraVC,
      };
    },
  },

  onAuth: async ({ challenge, claims, extraParams: { sessionDid } }) => {
    const vcClaim = claims.find(x => x.type === 'verifiableCredential');

    if (!vcClaim || !vcClaim.presentation) {
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

    const user = await User.findOne({ did: sessionDid });
    if (!user) {
      throw new Error('You are not a valid user, please login and retry');
    }
    if (user.extraVC !== vc.id) {
      throw new Error('You have not provide target VC');
    }
  },
};
