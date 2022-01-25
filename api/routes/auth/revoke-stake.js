/* eslint-disable no-console */
const { fromAddress } = require('@ocap/wallet');
const { toStakeAddress } = require('@arcblock/did-util');
const { fromTokenToUnit } = require('@ocap/util');

const env = require('../../libs/env');
const { wallet, client } = require('../../libs/auth');
const { getTokenInfo } = require('../../libs/util');

const txCreators = {
  RevokeLocalToken: async ({ userDid, userPk }) => {
    const token = await getTokenInfo();
    const amount = 5.275;
    const tokens = [{ address: env.localTokenId, value: fromTokenToUnit(amount, token.local.decimal).toString() }];

    return {
      type: 'RevokeStakeTx',
      data: {
        from: userDid,
        pk: userPk,
        itx: {
          address: toStakeAddress(userDid, wallet.address),
          outputs: [
            {
              owner: userDid,
              tokens,
            },
          ],
        },
      },
      description: 'Revoke staked token',
    };
  },
  RevokeForeignToken: async ({ userDid, userPk }) => {
    const token = await getTokenInfo();
    const amount = 5.275;
    const tokens = [{ address: env.foreignTokenId, value: fromTokenToUnit(amount, token.foreign.decimal).toString() }];

    return {
      type: 'RevokeStakeTx',
      data: {
        from: userDid,
        pk: userPk,
        itx: {
          address: toStakeAddress(userDid, wallet.address),
          outputs: [
            {
              owner: userDid,
              tokens,
            },
          ],
        },
      },
      description: 'Revoke staked token',
    };
  },
  RevokeNFT: async ({ userDid, userPk }) => {
    const stakeAddress = toStakeAddress(userDid, wallet.address);
    const { state } = await client.getStakeState({ address: stakeAddress });
    const asset = state.assets[0];
    if (!asset) {
      throw new Error('No NFT to revoke');
    }
    return {
      type: 'RevokeStakeTx',
      data: {
        from: userDid,
        pk: userPk,
        itx: {
          address: stakeAddress,
          outputs: [
            {
              owner: userDid,
              assets: [asset],
            },
          ],
        },
      },
      description: 'Revoke staked token',
    };
  },
};

module.exports = {
  action: 'revoke-stake',

  claims: {
    signature: async ({ userPk, userDid, extraParams: { type, locale } }) => {
      const claim = await txCreators[type]({ userPk, userDid, locale });
      return claim;
    },
  },

  onAuth: async ({ userDid, claims }) => {
    const claim = claims.find(x => x.type === 'signature');
    logger.info('revoke-stake.auth.claim', claim);

    const tx = client.decodeTx(claim.origin);
    const user = fromAddress(userDid);

    const hash = await client.sendRevokeStakeTx({
      tx,
      wallet: user,
      signature: claim.sig,
    });

    return { hash, tx };
  },
};
