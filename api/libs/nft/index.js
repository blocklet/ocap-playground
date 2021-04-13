/* eslint-disable indent */
const { fromJSON } = require('@ocap/wallet');
const { createCredentialList } = require('@arcblock/vc');
const { isValidFactory, formatFactoryState } = require('@ocap/asset');
const {
  getNodePurchaseTemplate,
  getNodeOwnerTemplate,
  getBlockletPurchaseTemplate,
} = require('@arcblock/nft/lib/templates');

const { wallet } = require('../auth');
const env = require('../env');

const nodePurchaseOutput = getNodePurchaseTemplate(env.serverUrl);
const nodeOwnerOutput = getNodeOwnerTemplate(env.serverUrl);
const blockletPurchaseOutput = getBlockletPurchaseTemplate(env.serverUrl);

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
    hooks: Array.isArray(hooks) ? hooks : [],
  };

  if (isValidFactory(props)) {
    return props;
  }

  throw new Error('factory props invalid: please check input/output/hooks');
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
  };

  const status = {
    NodePurchaseCredential: [
      {
        type: 'boolean',
        name: 'consume-status',
        reason: 'A node already launched for this NFT',
        label: translations.purchase.label[locale],
        text: translations.purchase.value[locale],
        value: !!asset.consumedTime,
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
  };

  const actions = {
    NodePurchaseCredential: asset.consumedTime
      ? []
      : [
          {
            id: `${env.serverUrl}/api/did/launch-instance/token`,
            type: 'api',
            name: 'launch-node',
            scope: 'private',
            label: translations.launch[locale],
          },
        ],
    NodeOwnershipCredential: [
      {
        id: `${env.serverUrl}/instance/dashboard`,
        type: 'navigate',
        name: 'manage-node',
        scope: 'private',
        label: translations.manage[locale],
      },
    ],
    BlockletPurchaseCredential: [
      {
        id: `${env.serverUrl}/blocklet/detail`,
        type: 'navigate',
        name: 'view-blocklet',
        scope: 'public',
        label: translations.view[locale],
      },
    ],
  };

  const type = vc.type.pop();

  return {
    id: vc.id,
    description: `Status and Actions of ${type}`,
    statusList: createCredentialList({
      issuer: { wallet: fromJSON(wallet), name: 'ocap-playground' },
      claims: status[type],
    }),
    actionList: createCredentialList({
      issuer: { wallet: fromJSON(wallet), name: 'ocap-playground' },
      claims: actions[type],
    }),
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
