/* eslint-disable no-console */
const assert = require('assert');
const { toBase64, fromBase58, toHex } = require('@ocap/util');
const { sign, verify } = require('@arcblock/jwt');

const { User } = require('../../models');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'sign-delegation',
  authPrincipal: false,
  claims: [
    {
      authPrincipal: async ({ extraParams: { sessionDid } }) => {
        const user = await User.ensureOne({ did: sessionDid });
        const [app] = user.generatedApps;
        assert(app, 'You must generate an application account first');

        return {
          description: 'Please select application account',
          target: app.address,
        };
      },
    },
    {
      signature: async ({ userDid, userPk, extraParams: { sessionDid } }) => {
        const user = await User.ensureOne({ did: sessionDid });
        const [app] = user.generatedApps;
        assert(app, 'You must generate an application account first');

        // 生成token的header和payload
        const headerAndPayload = sign(
          userDid,
          undefined,
          {
            from: app.address,
            to: wallet.address,
            userPk,
            permissions: [{ role: 'DIDConnectAgent', claims: ['encryptionKey'] }],
            exp: new Date().getTime() / 1000 + 60 * 60,
            version: '1.1.0',
          },
          false
        );

        const data = toHex(headerAndPayload);

        return {
          type: 'fg:x:delegation',
          description: 'Sign this delegation to allow playground to retrieve encryption key',
          mfa: true,
          data,
          meta: {
            headerAndPayload,
          },
        };
      },
    },
  ],

  onAuth: async ({ claims, extraParams: { sessionDid } }) => {
    const user = await User.ensureOne({ did: sessionDid });
    const [app] = user.generatedApps;
    assert(app, 'You must generate an application account first');

    const claim = claims.find(c => c.type === 'signature');
    const delegation = `${claim.meta.headerAndPayload}.${toBase64(fromBase58(claim.sig))}`;
    assert(await verify(delegation, fromBase58(app.publicKey)), 'delegation verify failed');

    app.delegation = delegation;

    user.generatedApps = [app];
    await User.update(user);

    return {
      successMessage: 'You have signed delegation for playground',
    };
  },
};
