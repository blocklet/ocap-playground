/* eslint-disable indent */
/* eslint-disable consistent-return */
const SDK = require('@ocap/sdk');
const cache = require('express-cache-headers');
const { isValid } = require('@arcblock/did');

const { create } = require('../libs/nft/display');
const { getCredentialList } = require('../libs/nft');

const options = { ignoreFields: ['state.context'] };

module.exports = {
  init(app) {
    const ensureVc = async (req, res, next) => {
      if (!req.query.assetId) {
        return res.status(404).send('Invalid request: missing nft asset id');
      }

      const { assetId } = req.query;
      if (isValid(assetId) === false) {
        return res.status(404).send('Invalid request: invalid nft asset id');
      }

      const { state: asset } = await SDK.getAssetState({ address: assetId }, options);
      if (!asset) {
        return res.status(404).send('Invalid request: nft asset not found');
      }

      const { data } = asset;
      if (data.typeUrl !== 'vc') {
        return res.status(404).send('Invalid request: nft asset is not a vc');
      }

      const vc = JSON.parse(data.value);

      req.vc = vc;
      req.asset = asset;

      next();
    };

    // Client should respect cache headers to avoid too many requests
    app.get('/api/nft/display', cache({ ttl: 24 * 60 * 60 }), ensureVc, async (req, res) => {
      const { vc, asset } = req;
      const { owner, parent, issuer } = asset;

      // owner is not always is account, so skip check accountState
      const [{ state: issuerState }, { state: factoryState }] = await Promise.all([
        // SDK.getAccountState({ address: owner }, options),
        SDK.getAccountState({ address: issuer }, options),
        SDK.getFactoryState({ address: parent }, options),
      ]);

      if (!issuerState) {
        return res.status(404).send('Invalid request: issuer not found');
      }
      if (!factoryState) {
        return res.status(404).send('Invalid request: factory not found');
      }

      res.type('svg');
      res.send(
        create(vc, {
          owner,
          issuer: issuerState.moniker,
          description: factoryState.description,
          date: vc.issuanceDate,
        })
      );
    });

    app.get('/api/nft/status', ensureVc, async (req, res) => {
      const { vc, asset } = req;
      res.jsonp(getCredentialList(asset, vc, req.query.locale || 'en'));
    });

    app.post('/api/nft/public-action', async (req, res) => {
      res.jsonp({ message: 'Hello from public NFT Action', date: new Date().toISOString(), ...req.query });
    });

    app.get('/blocklet/detail', ensureVc, async (req, res) => {
      const messages = {
        zh: `你正在查看 Blocklet 详情页：${req.query.assetId}`,
        en: `You are viewing blocklet detail：${req.query.assetId}`,
      };
      res.jsonp({ message: messages[req.query.locale || 'en'] });
    });

    app.get('/instance/dashboard', ensureVc, async (req, res) => {
      const messages = {
        zh: `你正在查看节点控制台：${req.query.assetId}`,
        en: `You are viewing node dashboard：${req.query.assetId}`,
      };
      res.jsonp({ message: messages[req.query.locale || 'en'] });
    });
  },
};
