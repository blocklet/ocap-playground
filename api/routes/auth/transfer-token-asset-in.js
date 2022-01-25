/* eslint-disable no-console */
const { toTypeInfo } = require('@arcblock/did');
const { fromPublicKey } = require('@ocap/wallet');

const env = require('../../libs/env');
const { wallet, client, factory: assetFactory } = require('../../libs/auth');
const { getRandomMessage, ensureAsset } = require('../../libs/util');

module.exports = {
  action: 'transfer_token_asset_in',
  claims: {
    signature: async () => {
      const { state } = await client.getForgeState();

      return {
        description: `签名该文本，你将获得 1 个测试用的 ${state.token.symbol}  和一个证书`,
        data: getRandomMessage(),
        type: 'mime:text/plain',
      };
    },
  },
  onAuth: async ({ claims, userDid, userPk }) => {
    try {
      const asset = await ensureAsset(assetFactory, {
        userPk,
        userDid,
        type: 'certificate',
        name: 'Test Certificate',
        description: 'Test Certificate Desc',
        location: 'China',
        logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });

      logger.info('transfer_asset_token_in.onAuth', { claims, userDid });
      const type = toTypeInfo(userDid);
      const user = fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('签名错误');
      }

      const hash = await client.transfer({
        to: userDid,
        tokens: [{ address: env.localTokenId, value: '1' }],
        assets: [asset.address],
        wallet,
      });
      logger.info('transfer_asset_token_in.onAuth.hash', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info('transfer_asset_token_in.onAuth.error', err);
      throw new Error('交易失败', err.message);
    }
  },
};
