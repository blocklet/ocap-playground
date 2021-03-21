/* eslint-disable no-console */
const ForgeSDK = require('@ocap/sdk');
const { toAssetAddress } = require('@arcblock/did-util');
const { decodeAny } = require('@ocap/message/lite');
const { fromAddress } = require('@ocap/wallet');

module.exports = {
  action: 'acquire_asset',
  claims: {
    signature: async ({ userPk, userDid }) => {
      const factoryAddress = 'zjdsHpUWuUjj41jY1P9Epno8Jvz5f5YKLMm3';

      const { state } = await ForgeSDK.getAssetState({ address: factoryAddress });
      if (!state) {
        throw new Error('Asset factory address does not exist on chain');
      }

      const decoded = decodeAny(state.data);
      if (!decoded) {
        throw new Error('Asset factory state cannot be decoded');
      }

      const factory = decoded.value;

      const assetVariables = [
        {
          cinema: '万达影院',
          name: '阿甘正传',
          location: '朝阳区',
          row: '6',
          seat: '6',
          datetime: new Date().toISOString(),
        },
      ];

      const assets = assetVariables.map(x => {
        const payload = {
          readonly: true,
          transferrable: factory.attributes.transferrable,
          ttl: factory.attributes.ttl,
          parent: factoryAddress,
          data: {
            type: factory.assetName,
            value: x,
          },
        };

        const address = toAssetAddress(payload);

        return { address, data: JSON.stringify(x) };
      });

      const data = {
        from: userDid,
        itx: {
          to: factoryAddress,
          specs: assets,
        },
        pk: userPk,
      };

      logger.info('acquire asset data:');
      logger.info(JSON.stringify(data, null, 2));
      return {
        type: 'AcquireAssetTx',
        data,
      };
    },
  },
  onAuth: async ({ claims, userDid }) => {
    const claim = claims.find(x => x.type === 'signature');
    logger.info('did_auth_acquire.auth.claim', claim);

    const tx = ForgeSDK.decodeTx(claim.origin);
    tx.signature = claim.sig;

    logger.info('did_auth_acquire.auth.tx', tx);
    const hash = await ForgeSDK.sendAcquireAssetTx({ tx, wallet: fromAddress(userDid) });
    logger.info('hash:', hash);
    return { hash, tx: claim.origin };
  },
};
