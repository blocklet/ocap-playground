/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { toTypeInfo } = require('@arcblock/did');

const { wallet, factory: assetFactory } = require('../../libs/auth');
const { getRandomMessage, ensureAsset } = require('../../libs/util');

// const ensureAsset = async (userPk, userDid) => {
//   const [asset] = await factory.createCertificate({
//     backgroundUrl: '',
//     data: {
//       name: '普通话二级甲等证书',
//       description: '普通话二级甲等证书',
//       reason: '普通话标准',
//       logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
//       issueTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
//       expireTime: -1,
//       recipient: new NFTRecipient({
//         wallet: SDK.Wallet.fromPublicKey(userPk),
//         name: userDid,
//         location: '北京市',
//       }),
//     },
//   });

//   return asset;
// };

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
      const user = SDK.Wallet.fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('签名错误');
      }

      const appWallet = SDK.Wallet.fromJSON(wallet);
      const hash = await SDK.sendTransferTx({
        tx: {
          itx: {
            to: userDid,
            assets: [asset.address],
          },
        },
        wallet: appWallet,
      });

      logger.info('transfer_asset_in.onAuth', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info('transfer_asset_in.onAuth.error', err);
      throw new Error('交易失败', err.message);
    }
  },
};
