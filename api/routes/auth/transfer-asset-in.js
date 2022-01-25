/* eslint-disable no-console */
const { fromPublicKey } = require('@ocap/wallet');
const { toTypeInfo } = require('@arcblock/did');

const { wallet, client, factory: assetFactory } = require('../../libs/auth');
const { getRandomMessage, ensureAsset } = require('../../libs/util');

module.exports = {
  action: 'transfer_asset_in',
  claims: {
    signature: async ({ extraParams: { locale } }) => {
      const messages = {
        en: 'Sign following text to get the certificate',
        zh: '签名如下文本，以获得证书',
      };

      return {
        description: messages[locale],
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

      logger.info('transfer_asset_in.onAuth', { claims, userDid });
      const type = toTypeInfo(userDid);
      const user = fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('签名错误');
      }

      const hash = await client.sendTransferV2Tx({
        tx: {
          itx: {
            to: userDid,
            assets: [asset.address],
          },
        },
        wallet,
      });

      logger.info('transfer_asset_in.onAuth', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info('transfer_asset_in.onAuth.error', err);
      throw new Error('交易失败', err.message);
    }
  },
};
