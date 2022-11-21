/* eslint-disable no-console */

const { fromBase58 } = require('@ocap/util');
const { fromAddress } = require('@ocap/wallet');
const env = require('../../libs/env');
const { wallet, client } = require('../../libs/auth');
const { pickGasPayerHeaders } = require('../../libs/util');

module.exports = {
  action: 'swap_token_v2',
  claims: {
    signature: async ({ userDid, userPk, extraParams: { action, rate, amount } }) => {
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
        itx.sender.tokens = [{ address: env.localTokenId, value: (await client.fromTokenToUnit(amount)).toString() }];
        itx.receiver.tokens = [
          { address: env.foreignTokenId, value: (await client.fromTokenToUnit(amount * rate)).toString() },
        ];
      }

      if (action === 'sell') {
        // User sell 1 TBA for 5 Play
        itx.sender.tokens = [
          { address: env.foreignTokenId, value: (await client.fromTokenToUnit(amount * rate)).toString() },
        ];
        itx.receiver.tokens = [{ address: env.localTokenId, value: (await client.fromTokenToUnit(amount)).toString() }];
      }

      const tx = await client.signExchangeV2Tx({
        tx: { itx },
        wallet,
      });

      tx.signaturesList.push({
        pk: fromBase58(userPk),
        signer: userDid,
      });

      return {
        type: 'ExchangeV2Tx',
        data: tx,
        description: 'Exchange between primary token and secondary token',
      };
    },
  },

  onAuth: async ({ req, userDid, claims }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      logger.info('swap_token.auth.claim', claim);

      const tx = client.decodeTx(claim.origin);
      if (claim.from) {
        tx.signaturesList[0].signer = claim.from;
      }
      if (claim.delegator) {
        tx.signaturesList[0].delegator = claim.delegator;
      }
      tx.signaturesList[0].signature = claim.sig;

      const hash = await client.sendExchangeV2Tx(
        {
          tx,
          wallet: fromAddress(userDid),
        },
        pickGasPayerHeaders(req)
      );

      logger.info('swap_token tx hash:', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info('swap_token.error:');
      logger.info(err);

      throw new Error(`swap_token failed: ${err.message}`);
    }
  },
};
