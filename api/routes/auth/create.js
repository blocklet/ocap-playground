/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromTokenToUnit } = require('@ocap/util');
const { toTypeInfo } = require('@arcblock/did');
const { toTokenAddress, toAssetAddress, toFactoryAddress } = require('@arcblock/did-util');

const env = require('../../libs/env');

const randomStr = str => `${str}${Math.floor(Math.random() * 10000)}`;

module.exports = {
  action: 'create',
  claims: {
    signature: async ({ userDid, userPk, extraParams: { type } }) => {
      if (['token', 'asset', 'factory'].includes(type) === false) {
        throw new Error('Invalid creating type, only token, asset and factory are supported');
      }

      let encoded = null;
      const wallet = SDK.Wallet.fromPublicKey(userPk);
      if (type === 'token') {
        const totalSupply = 10000;
        const decimal = 18;
        const itx = {
          name: 'User Token',
          description: `Test Token for ${userDid}`,
          symbol: randomStr('TT'),
          decimal,
          unit: 't',
          totalSupply: fromTokenToUnit(totalSupply, decimal).toString(),
          data: { type: 'json', value: { purpose: 'test' } },
        };
        itx.address = toTokenAddress(itx);
        encoded = await SDK.encodeCreateTokenTx({ tx: { from: userDid, pk: userPk, itx }, wallet });
      } else if (type === 'asset') {
        const itx = {
          moniker: randomStr('user-asset-'),
          readonly: false,
          transferrable: true,
          data: {
            type: 'json',
            value: {
              source: 'wallet-playground',
              purpose: 'test',
              user: userDid,
            },
          },
        };
        itx.address = toAssetAddress(itx);
        encoded = await SDK.encodeCreateAssetTx({ tx: { from: userDid, pk: userPk, itx }, wallet });
      } else if (type === 'factory') {
        const price = fromTokenToUnit(+(Math.random() * 10).toFixed(6), 18).toString(10);
        const itx = {
          name: 'UserTestFactory',
          description: 'NFT Factory created by playground test',
          settlement: 'instant',
          limit: 100,
          trustedIssuers: [],
          input: {
            value: '0',
            tokens: [{ address: env.localTokenId, value: price }],
            assets: [],
            variables: [],
          },
          output: {
            issuer: '{{ctx.issuer.id}}',
            parent: '{{ctx.factory}}',
            moniker: 'Asset from Test Factory',
            readonly: true,
            transferrable: false,
            data: {
              type: 'json',
              value: {
                '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
                holder: '{{ctx.owner}}',
                issuer: {
                  id: '{{ctx.issuer.id}}',
                  pk: '{{ctx.issuer.pk}}',
                  name: '{{ctx.issuer.name}}',
                },
              },
            },
          },
          hooks: [
            {
              name: 'mint',
              type: 'contract',
              hook: `transferToken("${env.localTokenId}","${userDid}","${price}");`,
            },
          ],
        };
        itx.address = toFactoryAddress(itx);
        encoded = await SDK.encodeCreateFactoryTx({ tx: { from: userDid, pk: userPk, itx }, wallet });
      }

      console.log('encoded.object', type, encoded.object);

      return {
        description: `Please sign the transaction to create ${type}`,
        type: 'fg:t:transaction',
        data: SDK.Util.toBase58(encoded.buffer),
      };
    },
  },

  // eslint-disable-next-line consistent-return
  onAuth: async ({ userDid, userPk, claims }) => {
    const type = toTypeInfo(userDid);
    const wallet = SDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');

    const tx = SDK.decodeTx(claim.origin);
    logger.info('create.auth.tx', tx);

    tx.signature = claim.sig;
    if (claim.delegator && claim.from) {
      tx.delegator = claim.delegator;
      tx.from = claim.from;
    }

    const typeUrl = tx?.itx?.typeUrl;

    if (typeUrl === 'fg:t:create_token') {
      const hash = await SDK.sendCreateTokenTx({ tx, wallet });
      return { hash };
    }

    if (typeUrl === 'fg:t:create_factory') {
      const hash = await SDK.sendCreateAssetTx({ tx, wallet });
      return { hash };
    }

    if (typeUrl === 'fg:t:create_asset') {
      const hash = await SDK.sendCreateFactoryTx({ tx, wallet });
      return { hash };
    }
  },
};
