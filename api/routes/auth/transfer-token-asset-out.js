/* eslint-disable no-console */
const { fromAddress } = require('@ocap/wallet');

const env = require('../../libs/env');
const { wallet, client } = require('../../libs/auth');
const { pickGasPayerHeaders } = require('../../libs/util');

module.exports = {
  action: 'transfer_token_asset_out',
  claims: {
    signature: async ({ userDid }) => {
      const { assets } = await client.listAssets({ ownerAddress: userDid });

      if (!assets) {
        throw new Error('You do not have any asset, use other test to earn one');
      }

      const asset = assets.find(x => x.transferrable);
      if (!asset) {
        throw new Error('You do not have any asset that can be transferred to me');
      }

      const { state } = await client.getForgeState();
      logger.info('transfer to:', wallet.address);
      logger.info('asset:', asset.address);
      return {
        type: 'TransferV2Tx',
        data: {
          itx: {
            to: wallet.address,
            assets: [asset.address],
            tokens: [{ address: env.localTokenId, value: (await client.fromTokenToUnit(1)).toString() }],
          },
        },
        description: `请发给我证书 ${asset.address} 和 1 ${state.token.symbol}`,
      };
    },
  },
  onAuth: async ({ req, claims, userDid }) => {
    try {
      logger.info('transfer_asset_token_out.onAuth', { claims, userDid });
      const claim = claims.find(({ type }) => type === 'signature');
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

      logger.info('transfer_asset_token_out.onAuth.hash', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info('transfer_asset_token_out.onAuth.error', err);
      throw new Error('交易失败', err.message);
    }
  },
};
