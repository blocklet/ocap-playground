const ForgeSDK = require('@ocap/sdk');
const { swapStorage, wallet } = require('../../libs/auth');

module.exports = {
  action: 'pickup_swap',
  claims: {
    swap: async ({ extraParams: { tid } }) => {
      const swap = await swapStorage.read(tid);
      logger.info('pickup_swap', swap);

      const [{ info: offerChainInfo }, { info: demandChainInfo }] = await Promise.all([
        ForgeSDK.getChainInfo({ conn: swap.offerChainId }),
        ForgeSDK.getChainInfo({ conn: swap.demandChainId }),
      ]);

      if (
        (swap.demandLocktime && swap.demandLocktime <= demandChainInfo.blockHeight)
        || (swap.offerLocktime && swap.offerLocktime <= offerChainInfo.blockHeight)
      ) {
        throw new Error('This order has expired, please place another order');
      }

      return {
        swapId: tid,
        receiver: wallet.address,
        ...swap,
      };
    },
  },

  onAuth: async () => ({}),
};
