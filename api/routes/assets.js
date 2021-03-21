const ForgeSDK = require('@ocap/sdk');

const env = require('../libs/env');

module.exports = {
  init(app) {
    app.get('/api/get_unconsumed_asset', async (req, res) => {
      const { assets } = await ForgeSDK.listAssets({ ownerAddress: req.query.userDid }, { conn: env.chainId });

      const asset = assets.find(x => x.consumedTime === '');

      if (asset) {
        return res.json(asset);
      }

      return res.status(404).json('Not Found');
    });
  },
};
