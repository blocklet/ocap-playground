/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
require('dotenv').config();
require('@blocklet/sdk/lib/error-handler');

const { verifyAccountAsync } = require('@ocap/tx-util');

const { wallet, client } = require('../auth');
const { getAccountStateOptions } = require('../util');
const token = require('../token');
const factory = require('../factory');
const env = require('../env');

const { chainId, tokenId } = env;

const ensureAccountDeclared = async () => {
  const { state } = await client.getAccountState({ address: wallet.address }, { ...getAccountStateOptions });
  if (!state) {
    console.error('Application account not declared on chain');

    const hash = await client.declare({
      moniker: 'ocap-playground',
      wallet,
    });

    console.log(`Application declared on chain ${chainId}`, hash);
    return { balance: 0, address: wallet.address };
  }

  return state;
};

const ensureTokenCreated = async () => {
  const { state } = await client.getTokenState({ address: token.address }, { ...getAccountStateOptions });
  if (!state) {
    const hash = await client.sendCreateTokenTx({ tx: { itx: token }, wallet });
    console.log(`token created on chain ${token.address}`, hash);
  } else {
    console.log(`token exist on chain ${token.address}`);
  }

  return state;
};

const ensureTokenFunded = async () => {
  const { state } = await client.getAccountState({ address: wallet.address }, { ...getAccountStateOptions });
  const t = state.tokens.find(x => x.key === tokenId);
  const balance = await client.fromUnitToToken(t ? t.value : '0');
  console.info(`application account token balance on chain ${chainId} is ${balance}`);
};

const ensureFactoryCreated = async itx => {
  const { state } = await client.getFactoryState({ address: itx.address }, { ...getAccountStateOptions });
  if (!state) {
    const hash = await client.sendCreateFactoryTx({ tx: { itx }, wallet });
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
    await ensureTokenCreated();
    await ensureTokenFunded();
    await ensureFactoryCreated(factory.nodePurchaseFactory);
    await ensureFactoryCreated(factory.nodeOwnerFactory);
    await ensureFactoryCreated(factory.blockletPurchaseFactory);
    await ensureFactoryCreated(factory.endpointTestFactory);
    await ensureFactoryCreated(factory.tokenInputTestFactory);
    await ensureFactoryCreated(factory.assetInputTestFactory);
    await ensureFactoryCreated(factory.nftTestFactory);
    process.exit(0);
  } catch (err) {
    console.error('ocap-playground pre-start error', err.message);
    process.exit(1);
  }
})();
