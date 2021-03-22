const { fromTokenToUnit } = require('@ocap/util');
const { toTokenAddress } = require('@arcblock/did-util');

const totalSupply = 1000000000; // 1 billion
const faucetSupply = 100000000; // 0.1 billion
const decimal = 18;

const itx = {
  name: 'Playground Token',
  description: 'Test Token for OCAP Playground',
  symbol: 'PLAY',
  unit: 'p',
  totalSupply: fromTokenToUnit(totalSupply, decimal).toString(),
  faucetSupply: fromTokenToUnit(faucetSupply, decimal).toString(),
  data: { type: 'json', value: { purpose: 'test' } },
};

itx.address = toTokenAddress(itx);

module.exports = itx;
