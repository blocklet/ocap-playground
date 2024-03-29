const fs = require('fs');
const path = require('path');
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
  'EndpointTestVCFactoryForPlayground',
  getFactoryProps({
    name: 'EndpointTestVCFactory',
    description: 'This is a factory to mint assets that have various test case for vc endpoints',
    moniker: 'EndpointTestVC',
    limit: 0,
    tokens: [{ address: env.localTokenId, value: toBNStr(5) }],
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
            content: joinUrl(env.appUrl, '/api/nft/display'), // accept asset-did in query param
          },
        },
        credentialStatus: {
          id: joinUrl(env.appUrl, '/api/did/vc-private-status/token'),
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
        hook: `transferToken('${env.localTokenId}', '${wallet.address}', '${toBNStr(5)}');`,
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
    tokens: [
      { address: env.localTokenId, value: toBNStr(1.99) },
      { address: token.address, value: toBNStr(2.99) },
    ],
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
            content: joinUrl(env.appUrl, '/api/nft/display'), // accept asset-did in query param
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
        hook: `transferToken('${env.localTokenId}', '${wallet.address}', '${toBNStr(1.99)}');transferToken('${
          token.address
        }', '${wallet.address}', '${toBNStr(2.99)}');`,
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
    assets: [tokenInputTestFactory.address],
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
            content: joinUrl(env.appUrl, '/api/nft/display'), // accept asset-did in query param
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

const nftTestFactory = createFactoryItx(
  'NFTTestFactoryForPlayground',
  getFactoryProps({
    name: 'NFTTestFactory',
    description: 'This is a factory to mint assets that is just an NFT',
    moniker: 'NFTTestNFT',
    limit: 0,
    tokens: [{ address: env.localTokenId, value: toBNStr(5) }],
    variables: [{ name: 'counter', required: true }],
    output: {
      type: 'json',
      value: {
        owner: '{{ctx.owner}}',
        counter: '{{input.counter}}',
        issuer: {
          id: '{{ctx.issuer.id}}',
          pk: '{{ctx.issuer.pk}}',
          name: '{{ctx.issuer.name}}',
        },
      },
    },
    display: {
      type: 'url',
      content: joinUrl(env.appUrl, '/api/nft/svg'),
    },
    endpoint: {
      id: joinUrl(env.appUrl, '/api/did/nft-private-status/token'),
      scope: 'private',
    },
    tags: ['NFTBadge', 'TestNFT'],
    hooks: [
      {
        type: 'contract',
        name: 'mint',
        hook: `transferToken('${env.localTokenId}', '${wallet.address}', '${toBNStr(5)}');`,
      },
    ],
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
    assets: [nodePurchaseFactory.address], // only purchase nft can be used to mint from this
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
  nftTest: nftTestFactory.address,
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
  nftTest: () => {
    let counter;
    const file = path.join(env.dataDir, 'counter.txt');
    if (fs.existsSync(file)) {
      counter = +fs.readFileSync(file).toString();
    }

    if (!counter) {
      counter = 1;
    }

    const next = 1 + counter;
    fs.writeFileSync(file, next.toString());
    return { counter: counter.toString() };
  },
};

module.exports = {
  nodePurchaseFactory,
  nodeOwnerFactory,
  blockletPurchaseFactory,
  endpointTestFactory,
  tokenInputTestFactory,
  assetInputTestFactory,
  nftTestFactory,
  formatFactoryState,
  factories,
  inputs,
  blockletDid,
};
