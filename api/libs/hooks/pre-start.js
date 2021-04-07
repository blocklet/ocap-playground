/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
require('dotenv').config();
require('@abtnode/util/lib/error-handler');

const SDK = require('@ocap/sdk');
const { verifyTxAsync, verifyAccountAsync } = require('@ocap/tx-util');
const batchPromises = require('batch-promises');
const range = require('lodash/range');

const { wallet } = require('../auth');
const { getAccountStateOptions } = require('../util');
const token = require('../token');
const factory = require('../factory');
const env = require('../env');

const { chainId, chainHost, tokenId } = env;
const app = SDK.Wallet.fromJSON(wallet);

// Check for application account
const ensureAccountDeclared = async () => {
  const {
    state: { txConfig },
  } = await SDK.getForgeState();
  if (txConfig.declare.restricted) {
    return null;
  }

  const { state } = await SDK.getAccountState({ address: wallet.address }, { ...getAccountStateOptions });
  if (!state) {
    console.error('Application account not declared on chain');

    const hash = await SDK.declare({
      moniker: 'ocap-playground',
      wallet: app,
    });

    console.log(`Application declared on chain ${chainId}`, hash);
    return { balance: 0, address: wallet.address };
  }

  return state;
};

const ensureTokenCreated = async () => {
  const { state } = await SDK.getTokenState({ address: tokenId }, { ...getAccountStateOptions });
  if (!state) {
    const hash = await SDK.sendCreateTokenTx({ tx: { itx: token }, wallet: app });
    console.log(`token created on chain ${chainId}`, hash);
  } else {
    console.log(`token exist on chain ${chainId}`, tokenId);
  }

  return state;
};

const ensureAccountFunded = async () => {
  const {
    state: { txConfig },
  } = await SDK.getForgeState();
  if (txConfig.poke.enabled === false) {
    return;
  }

  const { state } = await SDK.getAccountState({ address: wallet.address }, { ...getAccountStateOptions });

  // console.log('application account state', state);

  const balance = await SDK.fromUnitToToken(state.balance);
  console.info(`application account balance on chain ${chainId} is ${balance}`);
  const amount = 250;
  if (+balance < amount) {
    const limit = amount / 25;
    await batchPromises(5, range(1, limit + 1), async () => {
      const slave = SDK.Wallet.fromRandom();
      try {
        await SDK.declare({ moniker: 'sweeper', wallet: slave });
        await verifyAccountAsync({ chainId, chainHost, address: slave.toAddress() });
        const hash = await SDK.checkin({ wallet: slave });
        await verifyTxAsync({ chainId, chainHost, hash });
        await SDK.transfer({ to: wallet.address, token: 25, memo: 'found-primary-token', wallet: slave });
        console.info('Collect success', slave.toAddress());
      } catch (err) {
        console.info('Collect failed', err);
      }
    });
    console.info(`Application account funded with another ${amount}`);
  } else {
    console.info(`Application account balance greater than ${amount}`);
  }
};

const ensureTokenFunded = async () => {
  const {
    state: { txConfig },
  } = await SDK.getForgeState();
  if (txConfig.poke.enabled === false) {
    return;
  }

  const { state } = await SDK.getAccountState({ address: wallet.address }, { ...getAccountStateOptions });
  const t = state.tokens.find(x => x.key === tokenId);
  const balance = await SDK.fromUnitToToken(t ? t.value : '0');
  console.info(`application account token balance on chain ${chainId} is ${balance}`);
  const amount = 250;
  if (+balance < amount) {
    const limit = amount / 25;
    await batchPromises(5, range(1, limit + 1), async () => {
      const slave = SDK.Wallet.fromRandom();
      try {
        await SDK.declare({ moniker: 'token-sweeper', wallet: slave });
        await verifyAccountAsync({ chainId, chainHost, address: slave.toAddress() });
        const hash = await SDK.checkin({ wallet: slave, token: tokenId });
        await verifyTxAsync({ chainId, chainHost, hash });
        await SDK.transfer({
          to: wallet.address,
          tokens: [{ address: tokenId, value: 25 }],
          memo: 'fund-secondary-token',
          wallet: slave,
        });
        console.info('Collect success', slave.toAddress());
      } catch (err) {
        console.info('Collect failed', err);
      }
    });
    console.info(`token funded with another ${amount}`);
  } else {
    console.info(`token balance greater than ${amount}`);
  }
};

const ensureFactoryCreated = async itx => {
  const { state } = await SDK.getAssetState({ address: itx.address }, { ...getAccountStateOptions });
  if (!state) {
    const hash = await SDK.sendCreateAssetTx({ tx: { itx }, wallet: app });
    console.log(`factory created on chain ${itx.address}`, hash);
  } else {
    console.log(`factory exist on chain ${itx.address}`);
  }

  return state;
};

(async () => {
  try {
    await ensureAccountDeclared();
    await verifyAccountAsync({ chainId: env.chainId, chainHost: env.chainHost, address: wallet.address });
    await ensureAccountFunded();
    await ensureTokenCreated();
    await ensureTokenFunded();
    await ensureFactoryCreated(factory.nodePurchaseFactory);
    await ensureFactoryCreated(factory.nodeOwnerFactory);
    await ensureFactoryCreated(factory.blockletPurchaseFactory);
    process.exit(0);
  } catch (err) {
    console.error('ocap-playground pre-start error', err.message);
    process.exit(1);
  }
})();
