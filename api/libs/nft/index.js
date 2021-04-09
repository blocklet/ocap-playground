const { isValidFactory, formatFactoryState } = require('@ocap/asset');
const {
  getNodePurchaseTemplate,
  getNodeOwnerTemplate,
  getBlockletPurchaseTemplate,
} = require('@arcblock/nft/lib/templates');

const nodePurchaseOutput = getNodePurchaseTemplate(process.env.SERVER_URL);
const nodeOwnerOutput = getNodeOwnerTemplate(process.env.SERVER_URL);
const blockletPurchaseOutput = getBlockletPurchaseTemplate(process.env.SERVER_URL);

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
    hooks: (Array.isArray(hooks) ? hooks : []),
  };

  if (isValidFactory(props)) {
    return props;
  }

  throw new Error('factory props invalid: please check input/output/hooks');
};

module.exports = { getFactoryProps, formatFactoryState, nodePurchaseOutput, nodeOwnerOutput, blockletPurchaseOutput };
