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
  const [{ getForgeState: data }, { state: data2 }] = await Promise.all([
    SDK.doRawQuery(
      `{
      getForgeState {
        code
        state {
          token {
            decimal
            symbol
          }
        }
      }
    }`
    ),
    SDK.getTokenState({ address: env.tokenId }),
  ]);

  const result = {
    local: data.state.token,
    foreign: { symbol: data2.symbol, decimal: data.state.token.decimal },
  };

  return result;
};

const getAccountBalance = async userDid => {
  const [{ getAccountState: data }] = await Promise.all([
    SDK.doRawQuery(
      `{
      getAccountState(address: "${userDid}") {
        code
        state {
          balance
          tokens {
            key
            value
          }
        }
      }
    }`
    ),
  ]);

  let local = 0;
  let foreign = 0;
  if (data.state) {
    local = data.state.balance;

    const token = data.state.tokens.find(x => x.key === env.tokenId);
    if (token) {
      foreign = token.value;
    }
  }

  return {
    local,
    foreign,
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

module.exports = {
  getTransferrableAssets,
  getTokenInfo,
  getAccountBalance,
  getAccountStateOptions,
  transferVCTypeToAssetType,
  fetchAndGzipSvg,
  getRandomMessage,
  ensureAsset,
};
