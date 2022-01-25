/* eslint-disable no-console */
const Mcrypto = require('@ocap/mcrypto');
const { toDid, toBase58 } = require('@ocap/util');
const { fromRandom } = require('@ocap/wallet');
const { WalletType } = require('@ocap/wallet');
const { JWT } = require('@arcblock/did-auth');
const { wallet, client, agentStorage } = require('../libs/auth');
const env = require('../libs/env');

module.exports = {
  init(app) {
    // eslint-disable-next-line consistent-return
    app.get('/api/authorizations', async (req, res) => {
      if (!req.user) {
        return res.jsonp({ error: 'Please login to create your application and authorization' });
      }

      const ownerDid = req.user.did;
      let [authorization] = await agentStorage.listByOwner(ownerDid);
      if (authorization) {
        return res.jsonp(authorization);
      }

      // We need to create a new application for this user
      // Then make a fake authorization between the application and this dapp
      const type = WalletType({ role: Mcrypto.types.RoleType.ROLE_APPLICATION });
      const authorizer = fromRandom(type);
      const authorizeId = authorizer.address;

      // Declare the application
      const hash = await client.declare({
        issuer: ownerDid,
        moniker: 'demo_application',
        wallet: authorizer,
      });
      logger.info('application.declare', { ownerDid, authorizeId, hash });

      // Sign the token
      const now = Math.floor(Date.now() / 1000);
      const token = JWT.sign(authorizeId, authorizer.secretKey, {
        iat: now,
        nbf: now,
        exp: now + 365 * 24 * 60 * 60, // authorize for a year
        agentDid: toDid(wallet.address),
        ops: {
          profile: ['fullName', 'email', 'avatar'],
        },
      });

      // Create the authorization
      authorization = await agentStorage.create(authorizeId, {
        ownerDid,
        agentDid: wallet.address,
        appDid: authorizeId,
        appPk: toBase58(authorizer.publicKey),
        appSk: toBase58(authorizer.secretKey), // Please delete this line in production
        appName: 'My Demo Application',
        appDescription: `This is a random application generated to user ${ownerDid}`,
        appIcon: 'https://releases.arcblockio.cn/demo.png',
        chainHost: env.chainHost,
        certificateContent: token,
      });
      logger.info('authorization.create', authorization);

      res.jsonp(authorization);
    });
  },
};
