/* eslint-disable object-curly-newline */
const logger = require('winston');
const ForgeSDK = require('@arcblock/forge-sdk');

const env = require('../../libs/env');
const { swapStorage, wallet, foreignFactory, localFactory } = require('../../libs/auth');
const { getTransferrableAssets, ensureAsset } = require('../../libs/util');

const chains = {
  local: {
    host: env.chainHost,
    id: env.chainId,
  },
  foreign: {
    host: env.assetChainHost,
    id: env.assetChainId,
  },
};

// pfc => pay from chain
module.exports = {
  action: 'swap_asset',
  claims: {
    swap: async ({
      userDid,
      userPk,
      extraParams: { tid, pfc, action, type, name, price, desc, start, end, bg, logo, loc, svg },
    }) => {
      if (Number(price) <= 0) {
        throw new Error('Cannot buy/sell foreign asset without a valid price');
      }

      if (!name) {
        throw new Error('Cannot buy/sell foreign asset without a valid name');
      }

      if (['local', 'foreign'].includes(pfc) === false) {
        throw new Error('Invalid pay from chain param');
      }

      const assetFactory = pfc === 'local' ? foreignFactory : localFactory;

      if (action === 'buy') {
        try {
          const offerChain = pfc === 'local' ? chains.foreign : chains.local;
          const demandChain = pfc === 'local' ? chains.local : chains.foreign;

          const asset = await ensureAsset(assetFactory, {
            userPk,
            userDid,
            type,
            name,
            description: desc || name,
            location: loc || 'China',
            backgroundUrl: bg || '',
            logoUrl: logo || 'https://releases.arcblockio.cn/arcblock-logo.png',
            svg,
            startTime: start || new Date(),
            endTime: end || new Date(Date.now() + 2 * 60 * 60 * 1000),
          });

          const payload = {
            offerChainId: offerChain.id,
            offerChainHost: offerChain.host,
            offerAssets: [asset.address],
            offerToken: (await ForgeSDK.fromTokenToUnit(0, { conn: offerChain.id })).toString(),
            offerUserAddress: wallet.address, // 卖家地址

            demandChainId: demandChain.id,
            demandChainHost: demandChain.host,
            demandAssets: [],
            demandToken: (await ForgeSDK.fromTokenToUnit(price, { conn: demandChain.id })).toString(),
            demandUserAddress: userDid, // 买家地址
            demandLocktime: await ForgeSDK.toLocktime(600, { conn: demandChain.id }),
          };

          const res = await swapStorage.finalize(tid, payload);
          logger.info(`${type}.buy.finalize`, res);
          const swap = await swapStorage.read(tid);

          return {
            swapId: tid,
            receiver: wallet.address,
            ...swap,
          };
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log(err);
          logger.error('asset create failed', err);
          throw new Error('asset create failed');
        }
      }

      if (action === 'sell') {
        const offerChain = pfc === 'local' ? chains.local : chains.foreign;
        const demandChain = pfc === 'local' ? chains.foreign : chains.local;

        const assets = await getTransferrableAssets(userDid, 200, demandChain.id);
        const asset = assets.find(x => x.moniker === name);

        if (!asset) {
          throw new Error(`No ${type} to sell`);
        }

        // Since we are doing swap with reversed chain
        const payload = {
          offerChainId: offerChain.id,
          offerChainHost: offerChain.host,
          offerAssets: [],
          offerToken: (await ForgeSDK.fromTokenToUnit(price, { conn: offerChain.id })).toString(),
          offerUserAddress: wallet.address, // 卖家地址

          demandChainId: demandChain.id,
          demandChainHost: demandChain.host,
          demandAssets: [asset.address],
          demandToken: (await ForgeSDK.fromTokenToUnit(0, { conn: demandChain.id })).toString(),
          demandUserAddress: userDid, // 买家地址
          demandLocktime: await ForgeSDK.toLocktime(600, { conn: demandChain.id }),
        };

        const res = await swapStorage.finalize(tid, payload);
        logger.info(`${type}.sell.from.${pfc}.finalize`, res);
        const swap = await swapStorage.read(tid);

        return {
          swapId: tid,
          receiver: wallet.address,
          ...swap,
        };
      }

      throw new Error(`Unsupported ${type} action ${action}`);
    },
  },

  onAuth: async ({ claims, userDid, extraParams: { action, type, pfc } }) => {
    logger.info(`${type}.${action}.from.${pfc}.onAuth`, { userDid, claims });
  },
};
