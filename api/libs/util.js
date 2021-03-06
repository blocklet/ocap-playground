/* eslint-disable object-curly-newline */
const SDK = require('@ocap/sdk');
const Mcrypto = require('@ocap/mcrypto');
const { createZippedSvgDisplay, createCertSvg, createTicketSvg } = require('@arcblock/nft-template');
const { NFTRecipient, NFTIssuer } = require('@arcblock/nft');
const { NFTType } = require('@arcblock/nft/lib/enum');

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pako = require('pako');
const { toBase64 } = require('@ocap/util');

const { fromJSON } = require('@ocap/wallet');
const { preMintFromFactory } = require('@ocap/asset');

const { formatFactoryState, factories, inputs } = require('./factory');
const { getCredentialList } = require('./nft');

const env = require('./env');
const { wallet } = require('./auth');
const badgeArray = require('./svg');

const getTransferrableAssets = async (userDid, assetCount) => {
  const { assets } = await SDK.listAssets({ ownerAddress: userDid, paging: { size: 200 } });
  if (!assets || assets.length === 0) {
    throw new Error('You do not have any asset, use other test to earn one');
  }

  const goodAssets = assets.filter(x => x.transferrable);
  if (!goodAssets.length) {
    throw new Error('You do not have any asset that can be transferred to me');
  }

  if (assetCount && assetCount < 5 && goodAssets.length < assetCount) {
    throw new Error('You do not have enough assets that can be transferred to me');
  }

  return goodAssets.slice(0, assetCount);
};

const getTokenInfo = async () => {
  const [{ state: local }, { state: foreign }] = await Promise.all([
    SDK.getTokenState({ address: env.localTokenId }),
    SDK.getTokenState({ address: env.foreignTokenId }),
  ]);

  const result = {
    local: { symbol: local.symbol, decimal: local.decimal },
    foreign: { symbol: foreign.symbol, decimal: foreign.decimal },
  };

  return result;
};

const findTokenBalance = (tokens, tokenId) => {
  const token = tokens.find(x => x.address === tokenId);
  return token ? token.balance : '0';
};

const getAccountBalance = async userDid => {
  const { tokens } = await SDK.getAccountTokens({ address: userDid });
  return {
    local: findTokenBalance(tokens, env.localTokenId),
    foreign: findTokenBalance(tokens, env.foreignTokenId),
  };
};

const getAccountStateOptions = { ignoreFields: [/\.withdrawItems/, /\.items/] };

const fetchAndGzipSvg = async svg => {
  if (!svg) return null;

  if (badgeArray.includes(svg)) {
    return svg;
  }

  try {
    if (svg.indexOf('http') === 0) {
      const response = await axios.get(svg);
      return toBase64(pako.gzip(response.data));
    }
    if (fs.existsSync(svg)) {
      return toBase64(pako.gzip(fs.readFileSync(svg, 'utf8')));
    }
    if (fs.existsSync(path.join(process.cwd(), svg))) {
      return toBase64(pako.gzip(fs.readFileSync(path.join(process.cwd(), svg), 'utf8')));
    }
    const index = Math.floor(Math.random() * 10 + 1);
    return badgeArray[index % 10];
    // throw Error('svg file is not exists');
  } catch (error) {
    logger.error('download.svg.error', error);
    return null;
  }
};

const ensureAsset = async (
  factory,
  {
    userPk,
    userDid,
    type,
    name,
    description,
    backgroundUrl,
    logoUrl,
    svg,
    startTime,
    endTime,
    location = 'China',
    vcType = '',
  }
) => {
  const methods = {
    badge: factory.createBadge.bind(factory),
    ticket: factory.createTicket.bind(factory),
    certificate: factory.createCertificate.bind(factory),
  };
  if (type === 'badge' && !svg) {
    throw Error('Badge need a svg to display');
  }
  const gzipSvg = await fetchAndGzipSvg(svg);
  const data = {
    name,
    description,
    reason: description,
    logoUrl,
    location,
    display: gzipSvg,
    type: vcType,
    issueTime: Date.now(),
    startTime,
    endTime,
    expireTime: Date.now() + 365 * 3600,
    host: new NFTIssuer({
      // Only for tickets?
      wallet: SDK.Wallet.fromJSON(wallet),
      name: 'Wallet Playground',
    }),
    recipient: new NFTRecipient({
      wallet: SDK.Wallet.fromPublicKey(userPk),
      name: userDid,
      location: 'China, Beijing',
    }),
    endpoint: '',
    endpointScope: 'public',
  };
  const display =
    type === 'badge'
      ? gzipSvg
      : createZippedSvgDisplay(type === 'ticket' ? createTicketSvg({ data }) : createCertSvg({ data }));
  const [asset, hash] = await methods[type]({
    display,
    backgroundUrl,
    data,
  });

  logger.info('ensureAsset', {
    userPk,
    userDid,
    type,
    name,
    description,
    backgroundUrl,
    logoUrl,
    gzipSvg,
    location,
    asset,
    hash,
  });

  return asset;
};

const getRandomMessage = (len = 16) => {
  const hex = Mcrypto.getRandomBytes(len);
  return hex.replace(/^0x/, '').toUpperCase();
};

const transferVCTypeToAssetType = str => {
  let types = str;
  if (!Array.isArray(str)) {
    types = [str];
  }
  if (types.indexOf('NFTCertificate') > -1) {
    return NFTType.certificate;
  }
  if (types.indexOf('NFTTicket') > -1) {
    return NFTType.ticket;
  }
  if (types.indexOf('WalletPlaygroundAchievement') > -1 || types.indexOf('NFTBadge') > -1) {
    return NFTType.badge;
  }
  return NFTType.other;
};

const consumeNodePurchaseNFT = async ({ assetId, vc, userDid, locale }) => {
  const app = fromJSON(wallet);

  const { state } = await SDK.getFactoryState({ address: factories.nodeOwner });
  if (!state) {
    throw new Error('Asset factory does not exist on chain');
  }

  const preMint = preMintFromFactory({
    factory: formatFactoryState(state),
    inputs: { ...inputs.nodeOwner, purchaseId: vc.id, purchaseIssueId: vc.issuer.id },
    owner: userDid,
    issuer: { wallet: app, name: 'ocap-playground' },
  });

  logger.info('preMint', preMint);

  const itx = {
    factory: factories.nodeOwner,
    address: preMint.address,
    assets: [assetId],
    variables: Object.entries(preMint.variables).map(([key, value]) => ({ name: key, value })),
    issuer: preMint.issuer,
    owner: userDid,
  };

  const hash = await SDK.sendMintAssetTx({ tx: { itx }, wallet: app });
  logger.info('minted', hash);

  try {
    const { state: asset } = await SDK.getAssetState({ address: preMint.address }, { ignoreFields: ['context'] });
    if (asset && asset.data && asset.data.typeUrl === 'vc') {
      const minted = JSON.parse(asset.data.value);
      logger.error('launch.auth.vc', minted);
      return {
        disposition: 'attachment',
        type: 'VerifiableCredential',
        data: minted,
        assetId: preMint.address,
        ...getCredentialList(asset, vc, locale),
      };
    }
  } catch (err) {
    logger.error('launch.auth.asset.error', err);
  }

  return { hash };
};

module.exports = {
  getTransferrableAssets,
  getTokenInfo,
  getAccountBalance,
  getAccountStateOptions,
  transferVCTypeToAssetType,
  fetchAndGzipSvg,
  getRandomMessage,
  ensureAsset,
  consumeNodePurchaseNFT,
};
