const joinUrl = require('url-join');
const { fromTokenToUnit } = require('@ocap/util');
const { toFactoryAddress } = require('@arcblock/did-util');

const {
  getFactoryProps,
  nodePurchaseOutput,
  nodeOwnerOutput,
  blockletPurchaseOutput,
  formatFactoryState,
} = require('./nft');
const { wallet } = require('./auth');
const token = require('./token');
const env = require('./env');

const decimal = 18;
const toBNStr = n => fromTokenToUnit(n, decimal).toString();

const blockletDid = 'z1fEMZ6LoTw9FTBdiXQGCF7kqKAguvg9ExC';

const createFactoryItx = (moniker, props) => {
  const itx = {
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

  itx.address = toFactoryAddress(itx);

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
    hooks: [
      {
        type: 'contract',
        name: 'mint',
        hook: `transferToken('${token.address}', '${wallet.address}', '${toBNStr(5)}');`,
      },
    ],
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

const endpointTestFactory = createFactoryItx(
  'EndpointTestFactoryForPlayground',
  getFactoryProps({
    name: 'EndpointTestFactory',
    description: 'This is a factory to mint assets that have various test case for nft endpoints',
    moniker: 'EndpointTestNFT',
    limit: 0,
    value: toBNStr(5),
    assets: [],
    tokens: [],
    variables: [],
    output: {
      type: 'vc',
      value: {
        '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
        id: '{{input.id}}',
        type: ['VerifiableCredential', 'NFTBadge', 'EndpointTestCredential'],
        issuer: {
          id: '{{ctx.issuer.id}}',
          pk: '{{ctx.issuer.pk}}',
          name: '{{ctx.issuer.name}}',
        },
        issuanceDate: '{{input.issuanceDate}}',
        credentialSubject: {
          id: '{{ctx.owner}}',
          display: {
            type: 'url',
            content: joinUrl(env.serverUrl, '/api/nft/display'), // accept asset-did in query param
          },
        },
        credentialStatus: {
          id: joinUrl(env.serverUrl, '/api/did/nft-private-status/token'),
          type: 'NFTStatusList2021',
          scope: 'private',
        },
        proof: {
          type: '{{input.proofType}}',
          created: '{{input.issuanceDate}}',
          proofPurpose: 'assertionMethod',
          jws: '{{input.signature}}',
        },
      },
    },
    hooks: [
      {
        type: 'contract',
        name: 'mint',
        hook: `transfer('${wallet.address}', '${toBNStr(5)}');`,
      },
    ],
    data: {
      type: 'json',
      value: {},
    },
  })
);

const tokenInputTestFactory = createFactoryItx(
  'TokenInputTestFactoryForPlayground',
  getFactoryProps({
    name: 'TokenInputTestFactory',
    description: 'This is a factory to mint assets that use 2 tokens as input',
    moniker: 'TokenInputTestNFT',
    limit: 0,
    value: toBNStr(1.99),
    assets: [],
    tokens: [{ address: token.address, value: toBNStr(2.99) }],
    variables: [],
    output: {
      type: 'vc',
      value: {
        '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
        id: '{{input.id}}',
        type: ['VerifiableCredential', 'NFTBadge', 'TokenInputTestCredential'],
        issuer: {
          id: '{{ctx.issuer.id}}',
          pk: '{{ctx.issuer.pk}}',
          name: '{{ctx.issuer.name}}',
        },
        issuanceDate: '{{input.issuanceDate}}',
        credentialSubject: {
          id: '{{ctx.owner}}',
          display: {
            type: 'url',
            content: joinUrl(env.serverUrl, '/api/nft/display'), // accept asset-did in query param
          },
        },
        proof: {
          type: '{{input.proofType}}',
          created: '{{input.issuanceDate}}',
          proofPurpose: 'assertionMethod',
          jws: '{{input.signature}}',
        },
      },
    },
    hooks: [
      {
        type: 'contract',
        name: 'mint',
        hook: `transfer('${wallet.address}', '${toBNStr(1.99)}');transferToken('${token.address}', '${
          wallet.address
        }', '${toBNStr(2.99)}');`,
      },
    ],
    data: {
      type: 'json',
      value: {},
    },
  })
);

const assetInputTestFactory = createFactoryItx(
  'AssetInputTestFactoryForPlayground',
  getFactoryProps({
    name: 'AssetInputTestFactory',
    description: 'This is a factory to mint assets that use assets as input',
    moniker: 'AssetInputTestNFT',
    limit: 0,
    value: 0,
    assets: [tokenInputTestFactory.address],
    tokens: [],
    variables: [],
    output: {
      type: 'vc',
      value: {
        '@context': 'https://schema.arcblock.io/v0.1/context.jsonld',
        id: '{{input.id}}',
        type: ['VerifiableCredential', 'NFTBadge', 'AssetInputTestCredential'],
        issuer: {
          id: '{{ctx.issuer.id}}',
          pk: '{{ctx.issuer.pk}}',
          name: '{{ctx.issuer.name}}',
        },
        issuanceDate: '{{input.issuanceDate}}',
        credentialSubject: {
          id: '{{ctx.owner}}',
          display: {
            type: 'url',
            content: joinUrl(env.serverUrl, '/api/nft/display'), // accept asset-did in query param
          },
        },
        proof: {
          type: '{{input.proofType}}',
          created: '{{input.issuanceDate}}',
          proofPurpose: 'assertionMethod',
          jws: '{{input.signature}}',
        },
      },
    },
    data: {
      type: 'json',
      value: {},
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
        did: blockletDid,
        url: `https://registry.arcblock.io/blocklet/${blockletDid}`,
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
  endpointTest: endpointTestFactory.address,
  tokenInputTest: tokenInputTestFactory.address,
  assetInputTest: assetInputTestFactory.address,
};

const inputs = {
  nodePurchase: {
    // name: 'TestNode',
    // description: 'My awesome node',
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
  endpointTestFactory,
  tokenInputTestFactory,
  assetInputTestFactory,
  formatFactoryState,
  factories,
  inputs,
  blockletDid,
};
