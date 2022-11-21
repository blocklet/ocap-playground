/* eslint-disable no-console */
const { fromAddress } = require('@ocap/wallet');
const { wallet, client } = require('../../libs/auth');
const { getTransferrableAssets, pickGasPayerHeaders } = require('../../libs/util');

module.exports = {
  action: 'transfer_asset_out',
  claims: {
    signature: async ({ userDid }) => {
      const [asset] = await getTransferrableAssets(userDid);

      return {
        type: 'TransferV2Tx',
        data: {
          itx: {
            to: wallet.address,
            assets: [asset.address],
          },
        },
        description: `Please transfer asset ${asset.address} to me`,
      };
    },
  },
  onAuth: async ({ req, claims, userDid, extraParams: { locale } }) => {
    try {
      logger.info('transfer_asset_out.onAuth', { claims, userDid });
      const claim = claims.find(x => x.type === 'signature');
      const tx = client.decodeTx(claim.origin);
      const user = fromAddress(userDid);

      const hash = await client.sendTransferV2Tx(
        {
          tx,
          wallet: user,
          signature: claim.sig,
        },
        pickGasPayerHeaders(req)
      );

      logger.info('transfer_asset_out.onAuth', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info('transfer_asset_out.onAuth.error', err);
      const errors = {
        en: 'Payment failed!',
        zh: '支付失败',
      };
      throw new Error(errors[locale] || errors.en);
    }
  },
};
