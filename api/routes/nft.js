/* eslint-disable consistent-return */
const SDK = require('@ocap/sdk');
const { fromJSON } = require('@ocap/wallet');
const { createStatusList } = require('@arcblock/vc');
const { isValid } = require('@arcblock/did');

const { create } = require('../libs/nft/display');
const { wallet } = require('../libs/auth');

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

    app.get('/api/nft/display', ensureVc, async (req, res) => {
      const { vc, asset } = req;
      const { owner, parent, issuer } = asset;

      const [{ state: ownerState }, { state: issuerState }, { state: factoryState }] = await Promise.all([
        SDK.getAccountState({ address: owner }, options),
        SDK.getAccountState({ address: issuer }, options),
        SDK.getFactoryState({ address: parent }, options),
      ]);

      res.type('svg');
      res.send(
        create(vc, {
          owner: ownerState.address,
          issuer: issuerState.moniker,
          description: factoryState.description,
          date: vc.issuanceDate,
        })
      );
    });

    app.get('/api/nft/status', ensureVc, async (req, res) => {
      const { vc } = req;

      const list = {
        NodePurchaseCredential: [
          {
            type: 'boolean',
            value: 'consumed',
            reason: 'A node already launched for this NFT',
            translations: {
              label: {
                zh: '使用状态',
                en: 'Consume Status',
              },
              value: {
                zh: '已使用',
                en: 'Launched',
              },
            },
          },
        ],
        NodeOwnershipCredential: [
          {
            type: 'boolean',
            value: 'valid',
            reason: 'This credential is not expired',
            translations: {
              label: {
                zh: 'NFT 状态',
                en: 'Credential Status',
              },
              value: {
                zh: '有效',
                en: 'Valid',
              },
            },
          },
          {
            type: 'text',
            value: 'running',
            reason: 'ABT Node is running',
            translations: {
              label: {
                zh: '节点状态',
                en: 'Node Status',
              },
              value: {
                zh: '运行中',
                en: 'Running',
              },
            },
          },
        ],
      };

      const type = vc.type.pop();

      res.jsonp({
        id: vc.id,
        description: `Status of ${type}`,
        verifiableCredential: createStatusList({
          issuer: { wallet: fromJSON(wallet), name: 'ocap-playground' },
          statusList: list[type],
        }),
      });
    });

    app.get('/blocklet/:did', ensureVc, async (req, res) => {
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
