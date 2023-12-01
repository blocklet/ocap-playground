/* eslint-disable no-console */
const { fromPublicKey } = require('@ocap/wallet');
const { toTypeInfo } = require('@arcblock/did');
const { fromTokenToUnit } = require('@ocap/util');

const { toDelegateAddress } = require('@arcblock/did-util');
const env = require('../../libs/env');
const { wallet, client } = require('../../libs/auth');
const { pickGasPayerHeaders } = require('../../libs/util');

module.exports = {
  action: 'delegation-limit',
  claims: {
    signature: async ({ userPk, userDid, extraParams }) => {
      const { type = 1, tc = 0, ac = 0 } = extraParams;
      const limit = {
        tokens: [],
        assets: [],
      };

      const now = Math.round(Date.now() / 1000);
      const typeCount = +type;
      const tokenCount = +tc;
      const assetCount = +ac;

      const tokenLimit1 = {
        address: env.localTokenId,
        txAllowance: fromTokenToUnit(5).toString(),
        totalAllowance: fromTokenToUnit(100).toString(),
        txCount: 20,
        to: [wallet.address],
        validUntil: now + 60 * 60 * 24 * 30,
      };

      const tokenLimit2 = {
        address: env.localTokenId,
        txAllowance: fromTokenToUnit(5).toString(),
        totalAllowance: fromTokenToUnit(100).toString(),
        txCount: 20,
        to: [wallet.address],
        rate: {
          interval: 60,
        },
      };

      if (tokenCount === 1) {
        limit.tokens.push(tokenLimit1);
      }
      if (tokenCount === 2) {
        limit.tokens.push(tokenLimit1, tokenLimit2);
      }
      if (assetCount > 0) {
        const { assets } = await client.listAssets({
          ownerAddress: userDid,
          paging: { size: 10 },
        });
        limit.assets.push({
          address: assets.map(x => x.address),
          txCount: 5,
          to: [wallet.address],
          validUntil: now + 60 * 60 * 24 * 30,
        });
      }

      const ops = [];
      if (typeCount === 1) {
        ops.push({ typeUrl: 'fg:t:transfer_v2', limit });
      }
      if (typeCount === 2) {
        ops.push({ typeUrl: 'fg:t:transfer_v2', limit });
        ops.push({ typeUrl: 'fg:t:exchange_v2', limit });
      }

      return {
        type: 'DelegateTx',
        description: 'Sign the delegation to allow this app to do tx',
        wallet: fromPublicKey(userPk, toTypeInfo(userDid)),
        data: {
          itx: {
            address: toDelegateAddress(userDid, wallet.address),
            to: wallet.address,
            ops,
            data: {
              type: 'json',
              value: {
                salt: Math.random(),
              },
            },
          },
        },
      };
    },
  },

  onAuth: async ({ request, userDid, userPk, claims }) => {
    const claim = claims.find(x => x.type === 'signature');

    // execute the delegate tx
    const tx = client.decodeTx(claim.origin);
    tx.signature = claim.sig;

    const hash = await client.sendDelegateTx(
      { tx, wallet: fromPublicKey(userPk, toTypeInfo(userDid)) },
      pickGasPayerHeaders(request)
    );

    return { hash };
  },
};
