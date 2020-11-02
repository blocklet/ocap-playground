/* eslint-disable no-console */
const Mcrypto = require('@arcblock/mcrypto');
const ForgeSDK = require('@arcblock/forge-sdk');
const { WalletType } = require('@arcblock/forge-wallet');
const { JWT } = require('@arcblock/did-auth');
const { wallet, agentStorage } = require('../libs/auth');
const env = require('../libs/env');

module.exports = {
  init(app) {
    // eslint-disable-next-line consistent-return
    app.get('/api/authorizations', async (req, res) => {
      if (!req.user) {
        res.jsonp({ error: 'Please login to create your application and authorization' });
      }

      const ownerDid = req.user.did;
      let [authorization] = await agentStorage.listByOwner(ownerDid);
      if (authorization) {
        return res.jsonp(authorization);
      }

      // We need to create a new application for this user
      // Then make a fake authorization between the application and this dapp
      const type = WalletType({ role: Mcrypto.types.RoleType.ROLE_APPLICATION });
      const authorizer = ForgeSDK.Wallet.fromRandom(type);
      const authorizeId = authorizer.toAddress();

      // Declare the application
      const hash = await ForgeSDK.declare(
        {
          issuer: ownerDid,
          moniker: 'demo_application',
          wallet: authorizer,
        },
        { conn: env.chainId }
      );
      logger.info('application.declare', { ownerDid, authorizeId, hash });

      // Sign the token
      const now = Math.floor(Date.now() / 1000);
      const token = JWT.sign(authorizeId, authorizer.secretKey, {
        iat: now,
        nbf: now,
        exp: now + 365 * 24 * 60 * 60, // authorize for a year
        agentDid: ForgeSDK.Util.toDid(wallet.address),
        ops: {
          profile: ['fullName', 'email', 'avatar'],
        },
      });

      // Create the authorization
      authorization = await agentStorage.create(authorizeId, {
        ownerDid,
        agentDid: wallet.address,
        appDid: authorizeId,
        appPk: ForgeSDK.Util.toBase58(authorizer.publicKey),
        appSk: ForgeSDK.Util.toBase58(authorizer.secretKey), // Please delete this line in production
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
