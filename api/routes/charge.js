const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');

const { wallet } = require('../libs/auth');
const env = require('../libs/env');

module.exports = {
  init(app) {
    app.post('/api/charge', async (req, res) => {
      // eslint-disable-next-line object-curly-newline
      const { appDid, appPk, nonce, signature } = req.body;
      if (!appDid) {
        return res.jsonp({ error: 'appDid is required' });
      }
      if (!appPk) {
        return res.jsonp({ error: 'appPk is required' });
      }
      if (!signature) {
        return res.jsonp({ error: 'signature is required' });
      }
      if (!nonce) {
        return res.jsonp({ error: 'nonce is required' });
      }

      const type = toTypeInfo(appDid);
      const slave = ForgeSDK.Wallet.fromPublicKey(appPk, type);
      if (slave.verify(nonce, signature) === false) {
        return res.jsonp({ error: 'signature is invalid' });
      }

      const master = ForgeSDK.Wallet.fromJSON(wallet);
      const hash1 = await ForgeSDK.transfer({ to: appDid, token: 100000, wallet: master }, { conn: env.chainId });
      const hash2 = await ForgeSDK.transfer({ to: appDid, token: 200, wallet: master }, { conn: env.assetChainId });
      return res.jsonp({
        status: 'ok',
        local: hash1,
        foreign: hash2,
      });
    });
  },
};
