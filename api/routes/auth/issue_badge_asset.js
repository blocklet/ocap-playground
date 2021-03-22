/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { toTypeInfo } = require('@arcblock/did');

const { wallet, factory: assetFactory } = require('../../libs/auth');
const { getRandomMessage, ensureAsset } = require('../../libs/util');

const badgeArray = require('../../libs/svg');

const ensureBadge = async (userDid, userPk) => {
  const index = Math.floor(Math.random() * 10 + 1);
  const svg = badgeArray[index];
  const asset = await ensureAsset(assetFactory, {
    userPk,
    userDid,
    type: 'badge',
    name: `Random Badge #${index}`,
    description: 'Random Badge from Wallet Playground',
    svg,
  });

  return [asset];
};

module.exports = {
  action: 'issue_badge_asset',
  claims: {
    signature: async ({ userDid, userPk }) => {
      const [asset] = await ensureBadge(userDid, userPk);
      return {
        description: '签名该文本，你将获得如下徽章',
        data: getRandomMessage(),
        type: 'mime:text/plain',
        meta: {
          asset: asset.address,
        },
        display: JSON.stringify(asset.data.value.credentialSubject.display),
      };
    },
  },

  onAuth: async ({ userDid, userPk, claims }) => {
    try {
      logger.info('transfer_asset_in.onAuth', { claims, userDid });
      const type = toTypeInfo(userDid);
      const user = SDK.Wallet.fromPublicKey(userPk, type);
      const claim = claims.find(x => x.type === 'signature');

      if (user.verify(claim.origin, claim.sig) === false) {
        throw new Error('签名错误');
      }

      const appWallet = SDK.Wallet.fromJSON(wallet);
      const hash = await SDK.sendTransferV2Tx({
        tx: {
          itx: {
            to: userDid,
            assets: [claim.meta.asset],
          },
        },
        wallet: appWallet,
      });

      logger.info('transfer_asset_in.onAuth', hash);
      return { hash };
    } catch (err) {
      logger.info('transfer_asset_in.onAuth.error', err);
      throw new Error('交易失败', err.message);
    }
  },
};
