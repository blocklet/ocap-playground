/* eslint-disable consistent-return */
const SDK = require('@ocap/sdk');
const { isValid } = require('@arcblock/did');

const { create } = require('../libs/nft/display');

const options = { ignoreFields: ['state.context'] };

const getNftName = type => {
  const names = {
    NodePurchaseCredential: 'ABT Node Purchase Receipt',
    NodeOwnerCredential: 'Proof of ABT Node Ownership',
    BlockletPurchaseCredential: 'Blocklet Purchase Receipt',
  };

  const key = Object.keys(names).find(x => type.includes(x));
  return names[key];
};

module.exports = {
  init(app) {
    app.get('/api/nft/display', async (req, res) => {
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

      const { data, owner, parent, issuer } = asset;
      if (data.typeUrl !== 'vc') {
        return res.status(404).send('Invalid request: nft asset is not a vc');
      }

      const [{ state: ownerState }, { state: issuerState }, { state: factoryState }] = await Promise.all([
        SDK.getAccountState({ address: owner }, options),
        SDK.getAccountState({ address: issuer }, options),
        SDK.getFactoryState({ address: parent }, options),
      ]);

      const vc = JSON.parse(data.value);

      res.type('svg');
      res.send(
        create({
          name: getNftName(vc.type),
          owner: ownerState.address,
          issuer: issuerState.moniker,
          description: factoryState.description,
          date: vc.issuanceDate,
        })
      );
    });
  },
};
