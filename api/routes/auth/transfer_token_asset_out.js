/* eslint-disable no-console */
const ForgeSDK = require('@ocap/sdk');
const { fromAddress } = require('@ocap/wallet');

const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'transfer_token_asset_out',
  claims: {
    signature: async ({ userDid }) => {
      const { assets } = await ForgeSDK.listAssets({ ownerAddress: userDid });

      if (!assets) {
        throw new Error('You do not have any asset, use other test to earn one');
      }

      const asset = assets.find(x => x.transferrable);
      if (!asset) {
        throw new Error('You do not have any asset that can be transferred to me');
      }

      const { state } = await ForgeSDK.getForgeState({ conn: env.chainId });
      logger.info('transfer to:', wallet.address);
      logger.info('asset:', asset.address);
      return {
        type: 'TransferTx',
        data: {
          itx: {
            to: wallet.address,
            assets: [asset.address],
            value: ForgeSDK.Util.fromTokenToUnit(1),
          },
        },
        description: `请发给我证书 ${asset.address} 和 1 ${state.token.symbol}`,
      };
    },
  },
  onAuth: async ({ claims, userDid }) => {
    try {
      logger.info('transfer_asset_token_out.onAuth', { claims, userDid });
      const claim = claims.find(({ type }) => type === 'signature');
      const tx = ForgeSDK.decodeTx(claim.origin);
      const user = fromAddress(userDid);

      const hash = await ForgeSDK.sendTransferTx({
        tx,
        wallet: user,
        signature: claim.sig,
      });

      logger.info('transfer_asset_token_out.onAuth.hash', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info('transfer_asset_token_out.onAuth.error', err);
      throw new Error('交易失败', err.message);
    }
  },
};
