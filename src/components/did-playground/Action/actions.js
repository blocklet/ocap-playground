import mustache from 'mustache';

async function createSwapOrder(api) {
  const res = await api.post('/api/did/swap', {});
  return { tid: res.data.traceId };
}

const getValidPayAmount = (payAmount, price) => {
  if (Number(payAmount) >= 0) {
    return payAmount;
  }
  if (Number(price) >= 0) {
    return price;
  }
  return 1;
};

export const getMessage = (message = '', session = {}) => {
  try {
    return mustache.render(
      message,
      {
        user: session.user || {},
        token: session.token || {},
        balance: session.balance || {},
      },
      {},
      ['(%', '%)']
    );
  } catch (err) {
    console.error('Cannot render message', { message, session });
    return message;
  }
};

// https://github.com/ArcBlock/gatsby-extensions/issues/56
export const actions = {
  // Currency
  receive_local_token: {
    action: 'receive_token',
    extraParams: (props) => ({ chain: 'local', amount: props.amount || 1 }),
  },
  receive_foreign_token: {
    action: 'receive_token',
    extraParams: (props) => ({ chain: 'foreign', amount: props.amount || 1 }),
  },
  send_local_token: {
    action: 'send_token',
    extraParams: (props) => ({ chain: 'local', amount: props.amount || 1 }),
  },
  send_foreign_token: {
    action: 'send_token',
    extraParams: (props) => ({ chain: 'foreign', amount: props.amount || 1 }),
  },
  exchange_to_foreign_token: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: (props) => ({ action: 'buy', rate: props.exchangeRate, amount: props.amount || 1 }),
  },
  exchange_to_local_token: {
    action: 'swap_token',
    onStart: createSwapOrder,
    extraParams: (props) => ({ action: 'sell', rate: props.exchangeRate, amount: props.amount || 1 }),
  },

  exchange_to_foreign_token_v2: {
    action: 'swap_token_v2',
    onStart: createSwapOrder,
    extraParams: (props) => ({ action: 'buy', rate: props.exchangeRate, amount: props.amount || 1 }),
  },
  exchange_to_local_token_v2: {
    action: 'swap_token_v2',
    onStart: createSwapOrder,
    extraParams: (props) => ({ action: 'sell', rate: props.exchangeRate, amount: props.amount || 1 }),
  },

  // Cross chain assets and tokens
  buy_foreign_certificate_with_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'buy',
      type: 'certificate',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  buy_foreign_badge_with_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'buy',
      type: 'badge',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
      svg: props.svg,
    }),
  },
  buy_foreign_ticket_with_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'buy',
      type: 'ticket',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_foreign_certificate_for_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'sell',
      type: 'certificate',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
    }),
  },
  sell_foreign_badge_for_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'sell',
      type: 'badge',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
    }),
  },
  sell_foreign_ticket_for_local_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'sell',
      type: 'ticket',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
    }),
  },

  buy_foreign_certificate_with_local_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      action: 'buy',
      type: 'certificate',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  buy_foreign_badge_with_local_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      action: 'buy',
      type: 'badge',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
      svg: props.svg,
    }),
  },
  buy_foreign_ticket_with_local_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      action: 'buy',
      type: 'ticket',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_foreign_certificate_for_local_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      action: 'sell',
      type: 'certificate',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
    }),
  },
  sell_foreign_badge_for_local_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      action: 'sell',
      type: 'badge',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
    }),
  },
  sell_foreign_ticket_for_local_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      action: 'sell',
      type: 'ticket',
      pfc: 'local',
      price: props.price || 1,
      name: getMessage(props.name, session),
    }),
  },

  buy_local_certificate_with_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'buy',
      type: 'certificate',
      pfc: 'foreign',
      price: props.price || 1,
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  buy_local_badge_with_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'buy',
      type: 'badge',
      pfc: 'foreign',
      price: props.price || 0,
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
      svg: props.svg,
    }),
  },
  buy_local_ticket_with_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'buy',
      type: 'ticket',
      pfc: 'foreign',
      price: props.price || 1,
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_local_certificate_for_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'sell',
      type: 'certificate',
      pfc: 'foreign',
      price: props.price || 1,
      name: getMessage(props.name, session),
    }),
  },
  sell_local_badge_for_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'sell',
      type: 'vc',
      pfc: 'foreign',
      price: props.price || 1,
      name: getMessage(props.name, session),
    }),
  },
  sell_local_ticket_for_foreign_token: {
    action: 'swap_asset',
    onStart: createSwapOrder,
    extraParams: (props, session) => ({
      action: 'sell',
      type: 'ticket',
      pfc: 'foreign',
      price: props.price || 1,
      name: getMessage(props.name, session),
    }),
  },

  buy_local_certificate_with_foreign_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      pa: getValidPayAmount(props.payAmount, props.price),
      pt: 'token',
      ra: props.receiveAmount || 1,
      rt: 'certificate',
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  buy_local_badge_with_foreign_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      pa: getValidPayAmount(props.payAmount, props.price),
      pt: 'token',
      ra: props.receiveAmount || 1,
      rt: 'badge',
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
      svg: props.svg,
    }),
  },
  buy_local_ticket_with_foreign_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      pa: getValidPayAmount(props.payAmount, props.price),
      pt: 'token',
      ra: props.receiveAmount || 1,
      rt: 'badge',
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_local_certificate_for_foreign_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      pa: props.payAmount || 1,
      pt: 'certificate',
      ra: getValidPayAmount(props.receiveAmount, props.price),
      rt: 'token',
      name: getMessage(props.name, session),
    }),
  },
  sell_local_badge_for_foreign_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      pa: props.payAmount || 1,
      pt: 'badge',
      ra: getValidPayAmount(props.receiveAmount, props.price),
      rt: 'token',
      name: getMessage(props.name, session),
    }),
  },
  sell_local_ticket_for_foreign_token_v2: {
    action: 'swap_asset_v2',
    extraParams: (props, session) => ({
      pa: props.payAmount || 1,
      pt: 'ticket',
      ra: getValidPayAmount(props.receiveAmount, props.price),
      rt: 'token',
      name: getMessage(props.name, session),
    }),
  },

  // Exchange Scenarios
  buy_local_certificate_with_local_token: {
    action: 'exchange_assets',
    extraParams: (props, session) => ({
      pa: getValidPayAmount(props.payAmount, props.price),
      pt: 'token',
      ra: props.receiveAmount || 1,
      rt: 'certificate',
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_local_certificate_for_local_token: {
    action: 'exchange_assets',
    extraParams: (props, session) => ({
      pa: props.payAmount || 1,
      pt: 'certificate',
      ra: getValidPayAmount(props.receiveAmount, props.price),
      rt: 'token',
      name: getMessage(props.name, session),
    }),
  },
  buy_local_badge_with_local_token: {
    action: 'exchange_assets',
    extraParams: (props, session) => ({
      pa: getValidPayAmount(props.payAmount, props.price),
      pt: 'token',
      ra: props.receiveAmount || 1,
      rt: 'badge',
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
      svg: props.svg,
    }),
  },
  sell_local_badge_for_local_token: {
    action: 'exchange_assets',
    extraParams: (props, session) => ({
      pa: props.payAmount || 1,
      pt: 'badge',
      ra: getValidPayAmount(props.receiveAmount, props.price),
      rt: 'token',
      name: getMessage(props.name, session),
    }),
  },
  buy_local_ticket_with_local_token: {
    action: 'exchange_assets',
    extraParams: (props, session) => ({
      pa: getValidPayAmount(props.payAmount, props.price),
      pt: 'token',
      ra: props.receiveAmount || 1,
      rt: 'ticket',
      name: getMessage(props.name, session),
      desc: getMessage(props.description, session),
      loc: getMessage(props.location, session),
      bg: props.backgroundUrl,
      logo: props.logoUrl,
    }),
  },
  sell_local_ticket_for_local_token: {
    action: 'exchange_assets',
    extraParams: (props, session) => ({
      pa: props.payAmount || 1,
      pt: 'ticket',
      ra: getValidPayAmount(props.receiveAmount, props.price),
      rt: 'token',
      name: getMessage(props.name, session),
    }),
  },
  buy_local_ticket_with_local_certificate: {
    action: 'exchange_assets',
    extraParams: (props, session) => ({
      pa: props.payAmount || 1,
      pt: 'certificate',
      ra: props.receiveAmount || 1,
      rt: 'ticket',
      name: getMessage(props.name, session),
    }),
  },
  buy_local_certificate_with_local_ticket: {
    action: 'exchange_assets',
    extraParams: (props, session) => ({
      pa: props.payAmount || 1,
      pt: 'ticket',
      ra: props.receiveAmount || 1,
      rt: 'certificate',
      name: getMessage(props.name, session),
    }),
  },

  consume_local_asset: {
    action: 'consume_asset',
    extraParams: ({ type, typeUrl, name, did }, session) => ({
      pfc: 'local',
      type,
      tu: typeUrl,
      name: getMessage(name, session),
      did,
    }),
  },
  consume_foreign_asset: {
    action: 'consume_asset',
    extraParams: ({ type, typeUrl, name, did }, session) => ({
      pfc: 'foreign',
      type,
      tu: typeUrl,
      name: getMessage(name, session),
      did,
    }),
  },
  consume_local_asset_by_name: {
    action: 'consume_asset',
    extraParams: ({ name }, session) => ({
      pfc: 'local',
      name: getMessage(name, session),
    }),
  },
  consume_foreign_asset_by_name: {
    action: 'consume_asset',
    extraParams: ({ name }, session) => ({
      pfc: 'foreign',
      name: getMessage(name, session),
    }),
  },
  consume_local_asset_by_did: {
    action: 'consume_asset',
    extraParams: ({ did }) => ({
      pfc: 'local',
      did,
    }),
  },
  consume_foreign_asset_by_did: {
    action: 'consume_asset',
    extraParams: ({ did }) => ({
      pfc: 'foreign',
      did,
    }),
  },

  claim_signature: {
    action: 'claim_signature',
    extraParams: ({ type }) => ({ type }),
  },

  consume_email_vc: {
    action: 'consume_vc',
    extraParams: {},
  },
};

export const getActionName = (config, props) => {
  if (typeof config === 'string') {
    return config;
  }

  if (typeof config.action === 'string') {
    return config.action;
  }

  if (typeof config.action === 'function') {
    return config.action(props);
  }

  throw new Error('Cannot determine playground button action');
};

export const getActionParams = (config, props, session) => {
  if (typeof config === 'string') {
    return {};
  }

  if (!config.extraParams) {
    return {};
  }

  if (typeof config.extraParams === 'function') {
    return config.extraParams(props, session);
  }

  if (typeof config.extraParams === 'object') {
    return config.extraParams;
  }

  return {};
};
