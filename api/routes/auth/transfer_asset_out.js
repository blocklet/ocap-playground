/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromAddress } = require('@ocap/wallet');
const { wallet } = require('../../libs/auth');
const { getTransferrableAssets } = require('../../libs/util');

module.exports = {
  action: 'transfer_asset_out',
  claims: {
    signature: async ({ userDid }) => {
      const [asset] = await getTransferrableAssets(userDid);

      return {
        type: 'TransferTx',
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
  onAuth: async ({ claims, userDid, extraParams: { locale } }) => {
    try {
      logger.info('transfer_asset_out.onAuth', { claims, userDid });
      const claim = claims.find(x => x.type === 'signature');
      const tx = SDK.decodeTx(claim.origin);
      const user = fromAddress(userDid);

      const hash = await SDK.sendTransferV2Tx(
        {
          tx,
          wallet: user,
          signature: claim.sig,
        },
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
