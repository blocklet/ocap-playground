const cloneDeep = require('lodash/cloneDeep');
const { isValidFactory } = require('@ocap/asset');

const nodePurchaseOutput = require('./output/node-purchase');
const nodeOwnerOutput = require('./output/node-owner');
const blockletPurchaseOutput = require('./output/blocklet-purchase');

const getFactoryProps = ({
  name,
  moniker,
  description,
  value,
  assets = [],
  tokens = [],
  hooks = [],
  data,
  limit = 0,
  output,
  variables,
} = {}) => {
  const props = {
    name,
    description,
    settlement: 'instant',
    limit,
    trustedIssuers: [],
    input: {
      value,
      tokens: [...tokens],
      assets: [...assets],
      variables,
    },
    output: {
      issuer: '{{ctx.issuer.id}}',
      parent: '{{ctx.factory}}',
      moniker,
      readonly: true,
      transferrable: false,
      data: output,
    },
    data,
    hooks: (Array.isArray(hooks) ? hooks : []).concat([
      {
        name: 'postMint',
        type: 'url',
        hook: 'http://launcher.arcblock.io/api/purchases',
      },
    ]),
  };

  if (isValidFactory(props)) {
    return props;
  }

  throw new Error('factory props invalid: please check input/output/hooks');
};

const formatFactoryState = state => {
  const { address, output, data } = state;
  const outputX = cloneDeep(output);

  outputX.data.value = JSON.parse(outputX.data.value);
  outputX.data.type = outputX.data.typeUrl;

  return {
    address,
    output: outputX,
    data: JSON.parse(data.value),
  };
};

module.exports = { getFactoryProps, formatFactoryState, nodePurchaseOutput, nodeOwnerOutput, blockletPurchaseOutput };
