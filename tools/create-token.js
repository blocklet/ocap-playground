/* eslint-disable no-console */
require('dotenv').config();

const ForgeSDK = require('@ocap/sdk');

const { wallet } = require('../api/libs/auth');

(async () => {
  const app = ForgeSDK.Wallet.fromJSON(wallet);

  const totalSupply = 1000000000; // 1 billion
  const faucetSupply = 100000000; // 0.1 billion

  console.log({ totalSupply, faucetSupply });

  // Transfer to application
  const [hash, address] = await ForgeSDK.createToken({
    name: 'Playground Token',
    description: 'Token for OCAP Playground',
    symbol: 'PLAY',
    unit: 'p',
    totalSupply,
    faucetSupply,
    data: { type: 'json', value: { purpose: 'test' } },
    wallet: app,
  });

  console.log('token created', { hash, address });
})();
