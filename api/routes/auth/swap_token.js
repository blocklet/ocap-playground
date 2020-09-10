/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');

const env = require('../../libs/env');
const { swapStorage, wallet } = require('../../libs/auth');

module.exports = {
  action: 'swap_token',
  claims: {
    // eslint-disable-next-line object-curly-newline
    swap: async ({ userDid, extraParams: { tid, action, rate, amount } }) => {
      if (Number(rate) <= 0) {
        throw new Error('Invalid exchange rate param for swap token action');
      }
      if (Number(amount) <= 0) {
        throw new Error('Invalid exchange amount param for swap token action');
      }

      if (action === 'buy') {
        // User buy 1 TBA with 5 Play
        try {
          const payload = {
            offerChainId: env.assetChainId,
            offerChainHost: env.assetChainHost,
            offerAssets: [],
            offerToken: (await ForgeSDK.fromTokenToUnit(amount, { conn: env.assetChainId })).toString(),
            offerUserAddress: wallet.address, // 卖家地址

            demandChainId: env.chainId,
            demandChainHost: env.chainHost,
            demandAssets: [],
            demandToken: (await ForgeSDK.fromTokenToUnit(rate * amount, { conn: env.chainId })).toString(),
            demandUserAddress: userDid, // 买家地址
            demandLocktime: await ForgeSDK.toLocktime(2400, { conn: env.chainId }),
          };

          const res = await swapStorage.finalize(tid, payload);
          logger.info('swap.finalize', res);
          const swap = await swapStorage.read(tid);

          return {
            swapId: tid,
            receiver: wallet.address,
            ...swap,
          };
        } catch (err) {
          logger.error(err);
          throw new Error('换币失败，请重试');
        }
      }

      if (action === 'sell') {
        // User sell 1 TBA for 5 Play
        try {
          const payload = {
            offerChainId: env.chainId,
            offerChainHost: env.chainHost,
            offerAssets: [],
            offerToken: (await ForgeSDK.fromTokenToUnit(rate * amount, { conn: env.chainId })).toString(),
            offerUserAddress: wallet.address, // 卖家地址

            demandChainId: env.assetChainId,
            demandChainHost: env.assetChainHost,
            demandAssets: [],
            demandToken: (await ForgeSDK.fromTokenToUnit(amount, { conn: env.assetChainId })).toString(),
            demandUserAddress: userDid, // 买家地址
            demandLocktime: await ForgeSDK.toLocktime(2400, { conn: env.assetChainId }), // 30 minutes at 3 seconds/block
          };

          const res = await swapStorage.finalize(tid, payload);
          logger.info('swap.finalize', res);
          const swap = await swapStorage.read(tid);

          return {
            swapId: tid,
            receiver: wallet.address,
            ...swap,
          };
        } catch (err) {
          logger.error(err);
          throw new Error('换币失败，请重试');
        }
      }

      throw new Error(`Unsupported token swap action ${action}`);
    },
  },

  onAuth: async () => {},
};
