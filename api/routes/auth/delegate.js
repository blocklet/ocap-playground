/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromAddress } = require('@ocap/wallet');
const { toTypeInfo } = require('@arcblock/did');
const { types } = require('@ocap/mcrypto');
const { fromTokenToUnit } = require('@ocap/util');
const { preMintFromFactory } = require('@ocap/asset');

const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');
const { getAccountStateOptions, getTokenInfo } = require('../../libs/util');
const { formatFactoryState, factories, inputs } = require('../../libs/factory');

const app = SDK.Wallet.fromJSON(wallet);

const txCreators = {
  AcquireAssetV2Tx: async ({ userDid, userPk, input }) => {
    const inputFactories = {
      local: factories.endpointTest,
      foreign: factories.blockletPurchase,
      both: factories.tokenInputTest,
    };
    const { state } = await SDK.getFactoryState({ address: inputFactories[input] });
    if (!state) {
      throw new Error('Asset factory does not exist on chain');
    }

    const preMint = preMintFromFactory({
      factory: formatFactoryState(state),
      inputs: inputs.blockletPurchase,
      owner: userDid,
      issuer: { wallet: app, name: 'ocap-playground' }, // NOTE: using moniker must be enforced to make mint work
    });

    logger.info('preMint', preMint);

    return {
      type: 'AcquireAssetV2Tx',
      description: 'Acquire asset from application using delegation',
      data: {
        // The tx must from user
        from: userDid,
        pk: userPk,
        itx: {
          factory: inputFactories[input],
          address: preMint.address,
          assets: [],
          variables: Object.entries(preMint.variables).map(([key, value]) => ({ name: key, value })),
          issuer: preMint.issuer,
        },
      },
    };
  },

  TransferV2Tx: async () => {
    const token = await getTokenInfo();
    const amount = (Math.random() * 10 + 1).toFixed(6);

    return {
      type: 'TransferV2Tx',
      data: {
        itx: {
          to: wallet.address,
          value: fromTokenToUnit(0, token.foreign.decimal),
          tokens: [
            {
              address: env.tokenId,
              value: fromTokenToUnit(amount, token.foreign.decimal).toString(),
            },
          ],
        },
      },
      description: 'Transfer some token to application using delegation',
    };
  },

  ExchangeV2Tx: async ({ userPk, userDid }) => {
    const itx = {
      to: userDid,
      sender: {},
      receiver: {},
    };

    const amount = 1;
    const rate = 5;

    // User buy 1 TBA with 5 Play
    itx.sender.value = await SDK.fromTokenToUnit(amount);
    itx.receiver.tokens = [{ address: env.tokenId, value: (await SDK.fromTokenToUnit(amount * rate)).toString() }];

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
      description: 'Transfer with application using delegation',
    };
  },
};

module.exports = {
  action: 'delegate',
  authPrincipal: false, // disable default auth principal

  claims: [
    {
      authPrincipal: {
        description: 'Please generate a new user account',
        declareParams: {
          moniker: 'user-account',
          issuer: wallet.address,
        },
        targetType: {
          role: 'account',
          hash: 'sha3',
          key: 'ed25519',
        },
      },
    },
    {
      signature: async ({ userPk, userDid, extraParams: { type, locale, input } }) => {
        if (!txCreators[type]) {
          throw new Error(`${type} is not supported`);
        }

        const claim = await txCreators[type]({ userPk, userDid, locale, input });
        return claim;
      },
    },
  ],

  onAuth: async ({ userDid, claims, extraParams: { type } }) => {
    // 1. we need to ensure that the wallet is returning expected did type
    const info = toTypeInfo(userDid);
    if (info.role !== types.RoleType.ROLE_ACCOUNT) {
      throw new Error('The created DID must be an user DID');
    }
    if (info.hash !== types.HashType.SHA3) {
      throw new Error('The created DID must use SHA3 256');
    }
    if (info.pk !== types.KeyType.ED25519) {
      throw new Error('The created DID must use ED25519');
    }

    // 2. we need to ensure that the did is declared onchain
    const { state } = await SDK.getAccountState({ address: userDid }, getAccountStateOptions);
    if (!state) {
      throw new Error('The created DID is not created on chain as required');
    }

    // 3. ensure that delegator is set in response claim
    const claim = claims.find(x => x.type === 'signature');
    logger.info('acquire.auth.claim', claim);
    if (!claim.delegator) {
      throw new Error('claim.delegator must be set to send this tx');
    }
    if (!claim.from) {
      throw new Error('claim.from must be set to send this tx');
    }

    const tx = SDK.decodeTx(claim.origin);
    logger.info('acquire.auth.tx', tx);

    if (type === 'AcquireAssetV2Tx') {
      tx.signature = claim.sig;
      tx.delegator = claim.delegator;
      tx.from = claim.from;
      const hash = await SDK.sendAcquireAssetV2Tx({ tx, wallet: fromAddress(userDid) });
      return { hash, tx: claim.origin };
    }

    if (type === 'TransferV2Tx') {
      tx.signature = claim.sig;
      tx.delegator = claim.delegator;
      tx.from = claim.from;
      const hash = await SDK.sendTransferV2Tx({ tx, wallet: fromAddress(userDid) });
      return { hash, tx: claim.origin };
    }

    if (type === 'ExchangeV2Tx') {
      tx.signaturesList[0].signature = claim.sig;
      tx.signaturesList[0].signer = claim.from;
      tx.signaturesList[0].delegator = claim.delegator;
      const hash = await SDK.sendExchangeV2Tx({ tx, wallet: fromAddress(userDid) });
      return { hash, tx: claim.origin };
    }

    throw new Error(`${type} is not supported`);
  },
};
