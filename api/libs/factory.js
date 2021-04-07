const { fromTokenToUnit } = require('@ocap/util');
const { toAssetAddress } = require('@arcblock/did-util');

const {
  getFactoryProps,
  nodePurchaseOutput,
  nodeOwnerOutput,
  blockletPurchaseOutput,
  formatFactoryState,
} = require('./nft');
const { wallet } = require('./auth');
const token = require('./token');

const decimal = 18;
const toBNStr = n => fromTokenToUnit(n, decimal).toString();

const createFactoryItx = (moniker, props) => {
  const factoryProps = {
    name: props.name,
    description: props.description,
    settlement: 'instant',
    limit: props.limit || 0,
    trustedIssuers: props.trustedIssuers || [],
    input: props.input,
    output: props.output,
    data: props.data || null,
    hooks: props.hooks || [],
  };

  const itx = {
    moniker,
    readonly: true,
    transferrable: false,
    ttl: 0,
    data: {
      type: 'AssetFactory',
      value: factoryProps,
    },
  };

  const factoryAddress = toAssetAddress(itx);
  itx.address = factoryAddress;

  return itx;
};

const nodePurchaseFactory = createFactoryItx(
  'NodePurchaseFactoryForPlayground',
  getFactoryProps({
    name: 'NodePurchaseFactory',
    description: 'Purchase ABT Node t2.small instance for 1 month',
    moniker: 'NodePurchaseNFT',
    limit: 0,
    value: '0',
    assets: [],
    tokens: [{ address: token.address, value: toBNStr(5) }],
    variables: [],
    output: nodePurchaseOutput,
    data: {
      type: 'json',
      value: {
        type: 't2.small',
        period: '1 month',
        owner: wallet.address,
      },
    },
  })
);

const nodeOwnerFactory = createFactoryItx(
  'NodeOwnerFactoryForPlayground',
  getFactoryProps({
    name: 'NodeOwnerFactory',
    description: 'Get your node up and running within minutes',
    moniker: 'NodeOwnerNFT',
    limit: 0,
    value: '0',
    assets: [nodePurchaseFactory.address], // only purchase nft can be used to mint from this
    tokens: [],
    variables: [
      {
        name: 'nodeId',
        required: true,
      },
      {
        name: 'nodeProvider',
        required: true,
      },
    ],
    output: nodeOwnerOutput,
    data: {
      type: 'json',
      value: {
        owner: wallet.address,
      },
    },
  })
);

const blockletPurchaseFactory = createFactoryItx(
  'BlockletPurchaseFactoryForPlayground',
  getFactoryProps({
    name: 'BlockletPurchaseFactory',
    description: 'Purchase our demo blocklet',
    moniker: 'BlockletPurchaseNFT',
    limit: 0,
    value: '0',
    assets: [],
    tokens: [{ address: token.address, value: toBNStr(2) }],
    variables: [],
    hooks: [
      {
        type: 'contract',
        name: 'mint',
        hook: `transferToken('${token.address}', '${wallet.address}', '${toBNStr(2)}');`,
      },
    ],
    output: blockletPurchaseOutput,
    data: {
      type: 'json',
      value: {
        did: 'z1fEMZ6LoTw9FTBdiXQGCF7kqKAguvg9ExC',
        url: 'https://registry.arcblock.io/blocklet/z1fEMZ6LoTw9FTBdiXQGCF7kqKAguvg9ExC',
        name: 'Demo Blocklet',
        owner: wallet.address,
      },
    },
  })
);

const factories = {
  nodePurchase: nodePurchaseFactory.address,
  nodeOwner: nodeOwnerFactory.address,
  blockletPurchase: blockletPurchaseFactory.address,
};

const inputs = {
  nodePurchase: {
    name: 'TestNode',
    description: 'My awesome node',
  },
  nodeOwner: {
    nodeId: 'zNKpGKR2BY6CQzPhTwGd8QqLXdunzsQh9e37',
    nodeProvider: 'AWS',
  },
  blockletPurchase: {},
};

module.exports = {
  nodePurchaseFactory,
  nodeOwnerFactory,
  blockletPurchaseFactory,
  formatFactoryState,
  factories,
  inputs,
};
