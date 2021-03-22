/* eslint-disable no-console */
const SDK = require('@ocap/sdk');

const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'swap_token_v2',
  claims: {
    // eslint-disable-next-line object-curly-newline
    swap: async ({ userDid, userPk, extraParams: { action, rate, amount } }) => {
      if (Number(rate) <= 0) {
        throw new Error('Invalid exchange rate param for swap token action');
      }
      if (Number(amount) <= 0) {
        throw new Error('Invalid exchange amount param for swap token action');
      }

      const itx = {
        to: userDid,
        sender: {},
        receiver: {},
      };

      // User buy 1 TBA with 5 Play
      if (action === 'buy') {
        itx.sender.value = await SDK.fromTokenToUnit(amount);
        itx.receiver.tokens = [{ address: env.tokenId, value: (await SDK.fromTokenToUnit(amount * rate)).toString() }];
      }

      if (action === 'sell') {
        // User sell 1 TBA for 5 Play
        itx.sender.tokens = [{ address: env.tokenId, value: (await SDK.fromTokenToUnit(amount * rate)).toString() }];
        itx.receiver.value = await SDK.fromTokenToUnit(amount);
      }

      const tx = await SDK.signExchangeV2Tx({
        tx: { itx },
        wallet: SDK.Wallet.fromJSON(wallet),
      });

      tx.signaturesList.push({
        pk: SDK.Util.fromBase58(userPk),
        signer: userDid,
      });

      return {
        type: 'ExchangeV2Tx',
        data: tx,
        description: 'Exchange between primary token and secondary token',
      };
    },
  },

  onAuth: async ({ claims }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      logger.info('exchange.auth.claim', claim);

      const tx = SDK.decodeTx(claim.origin);

      tx.signaturesList[0].signature = claim.sig;

      const hash = await SDK.exchange({
        tx,
        wallet: SDK.Wallet.fromJSON(wallet),
      });

      logger.info('exchange tx hash:', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info('swap_asset.error:');
      logger.info(err);

      throw new Error(`Exchange failed: ${err.message}`);
    }
  },
};
