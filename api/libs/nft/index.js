/* eslint-disable indent */
const { createCredentialList } = require('@arcblock/vc');
const { toFactoryAddress } = require('@arcblock/did-util');
const { isValidFactory, formatFactoryState } = require('@ocap/asset');
const getNodePurchaseTemplate = require('./templates/node-purchase');
const getNodeOwnerTemplate = require('./templates/node-owner');
const getBlockletPurchaseTemplate = require('./templates/blocklet-purchase');
const { wallet } = require('../auth');
const env = require('../env');

const nodePurchaseOutput = getNodePurchaseTemplate(env.appUrl);
const nodeOwnerOutput = getNodeOwnerTemplate(env.appUrl);
const blockletPurchaseOutput = getBlockletPurchaseTemplate(env.appUrl);

const getFactoryProps = ({
  name,
  moniker,
  description,
  value = '0',
  assets = [],
  tokens = [],
  hooks = [],
  data,
  limit = 0,
  output,
  variables,
  endpoint,
  display,
  tags = [],
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
      transferrable: true,
      data: output,
      endpoint,
      display,
      tags,
    },
    data,
    hooks: Array.isArray(hooks) ? hooks : [],
  };

  props.address = toFactoryAddress(props);
  isValidFactory(props, true);

  return props;
};

const getCredentialList = (asset, vc, locale) => {
  const translations = {
    purchase: {
      label: {
        zh: '使用状态',
        en: 'Consume Status',
      },
      value: {
        zh: asset.consumedTime ? '已使用' : '未使用',
        en: asset.consumedTime ? 'Launched' : 'Node Not Launched',
      },
    },
    ownership: {
      label: {
        zh: 'NFT 状态',
        en: 'Credential Status',
      },
      value: {
        zh: '有效',
        en: 'Valid',
      },
    },
    node: {
      label: {
        zh: '节点状态',
        en: 'Node Status',
      },
      value: {
        zh: '运行中',
        en: 'Running',
      },
    },
    launch: {
      zh: '启动节点',
      en: 'Launch Node',
    },
    manage: {
      zh: '管理节点',
      en: 'Manage Node',
    },
    view: {
      zh: '查看 Blocklet',
      en: 'View Blocklet',
    },
    restartInstance: {
      zh: '重启(非静默授权)',
      en: 'Restart(非静默授权)',
    },
  };

  const status = {
    NodePurchaseCredential: [
      {
        type: 'boolean',
        name: 'consume-status',
        reason: 'A node already launched for this NFT',
        label: translations.purchase.label[locale],
        text: translations.purchase.value[locale],
        value: String(!!asset.consumedTime),
      },
    ],
    NodeOwnershipCredential: [
      {
        type: 'switch',
        name: 'validity',
        reason: 'This credential is not expired',
        label: translations.ownership.label[locale],
        text: translations.ownership.value[locale],
        value: 'on',
      },
      {
        type: 'text',
        name: 'running-status',
        reason: 'ABT Node is running',
        label: translations.node.label[locale],
        value: translations.node.value[locale],
      },
    ],
    EndpointTestCredential: [
      {
        type: 'boolean',
        name: 'boolean-true',
        reason: 'Just for test purposes',
        label: 'Health Status',
        text: 'Healthy',
        value: 'true',
      },
      {
        type: 'boolean',
        name: 'boolean-false',
        reason: 'Just for test purposes',
        label: 'Node Status',
        text: 'Broken',
        value: 'false',
      },
      {
        type: 'switch',
        name: 'switch-on',
        reason: 'Just for test purposes',
        label: 'Security Mode',
        text: 'On',
        value: 'on',
      },
      {
        type: 'switch',
        name: 'switch-off',
        reason: 'Just for test purposes',
        label: 'Dark Mode',
        text: 'Off',
        value: 'off',
      },
      {
        type: 'text',
        name: 'text-short',
        reason: 'Just for testing purposes',
        label: 'Text Short',
        value: 'Short Text',
      },
      {
        type: 'text',
        name: 'text-long',
        reason: 'Just for testing purposes',
        label: 'Text Long',
        value: 'Loooooooooooooooooooooooooooooooooooooooooooooooooong Text',
      },
    ],
  };

  const actions = {
    NodePurchaseCredential: asset.consumedTime
      ? []
      : [
          {
            id: `${env.appUrl}/api/did/launch-instance/token`,
            type: 'api',
            name: 'launch-node',
            scope: 'private',
            label: translations.launch[locale],
          },
        ],
    NodeOwnershipCredential: [
      {
        id: `${env.appUrl}/instance/dashboard`,
        type: 'navigate',
        name: 'manage-node',
        scope: 'public',
        label: translations.manage[locale],
      },
      {
        id: `${env.appUrl}/api/did/restart-instance/token`,
        type: 'api',
        name: 'restart-instance',
        scope: 'private',
        supervised: 'true',
        label: translations.restartInstance[locale],
      },
    ],
    BlockletPurchaseCredential: [
      {
        id: `${env.appUrl}/blocklet/detail`,
        type: 'navigate',
        name: 'view-blocklet',
        scope: 'public',
        label: translations.view[locale],
      },
    ],
    EndpointTestCredential: [
      {
        id: `${env.appUrl}/api/nft/public-action`,
        type: 'api',
        scope: 'public',
        name: 'call-public-api',
        label: 'Call Public API',
      },
      {
        id: `${env.appUrl}/api/did/vc-private-action/token`,
        type: 'api',
        scope: 'private',
        name: 'call-private-api',
        label: 'Call Private API',
      },
      {
        id: `${env.appUrl}`,
        type: 'navigate',
        scope: 'public',
        name: 'open-dapp',
        label: 'Open DApp',
      },
      {
        id: 'https://github.com/arcblock',
        type: 'navigate',
        scope: 'public',
        name: 'open-github',
        label: 'Open Github',
      },
      // TODO: make this work
      // {
      //   id: 'https://github.com/arcblock',
      //   type: 'navigate',
      //   scope: 'public',
      //   name: 'open-github',
      //   label: 'Login before Open',
      // },
    ],
    TestNFT: [
      {
        id: `${env.appUrl}/api/nft/public-action`,
        type: 'api',
        scope: 'public',
        name: 'call-public-api',
        label: 'Call Public API',
      },
      {
        id: `${env.appUrl}/api/did/nft-private-action/token`,
        type: 'api',
        scope: 'private',
        name: 'call-private-api',
        label: 'Call Private API',
      },
      {
        id: `${env.appUrl}`,
        type: 'navigate',
        scope: 'public',
        name: 'open-dapp',
        label: 'Open DApp',
      },
      {
        id: 'https://github.com/arcblock',
        type: 'navigate',
        scope: 'public',
        name: 'open-github',
        label: 'Open Github',
      },
    ],
  };

  const supportedTypes = [
    'NodePurchaseCredential',
    'NodeOwnershipCredential',
    'BlockletPurchaseCredential',
    'EndpointTestCredential',
    'TestNFT',
  ];
  let type = null;

  if (vc) {
    const types = Array.isArray(vc.type) ? vc.type : [vc.type];
    type = types.find(t => supportedTypes.includes(t));
  } else {
    type = asset.tags.find(t => supportedTypes.includes(t));
  }

  let statusList = [];
  let actionList = [];
  const issuer = { wallet, name: 'ocap-playground' };

  if (status[type]) {
    statusList = createCredentialList({
      issuer,
      claims: status[type],
    });
  }

  if (actions[type]) {
    actionList = createCredentialList({
      issuer,
      claims: actions[type],
    });
  }

  return {
    id: vc ? vc.id : asset.address,
    description: `Status and Actions of ${type}`,
    statusList,
    actionList,
  };
};

module.exports = {
  getFactoryProps,
  formatFactoryState,
  nodePurchaseOutput,
  nodeOwnerOutput,
  blockletPurchaseOutput,
  getCredentialList,
};
