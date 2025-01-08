/* eslint-disable object-curly-newline */
const { fromBase58 } = require('@ocap/util');
const { fromPublicKey } = require('@ocap/wallet');
const { NFTType } = require('@arcblock/nft/lib/enum');
const { toTypeInfo } = require('@arcblock/did');
const upperFirst = require('lodash/upperFirst');

const env = require('../../libs/env');
const { wallet, client, factory: assetFactory } = require('../../libs/auth');
const { ensureAsset, getTransferrableAssets, transferVCTypeToAssetType } = require('../../libs/util');

const getAssets = async ({ amount = 1, type, userPk, userDid, name, desc, start, end, bg, logo, loc, svg }) => {
  const tasks = [];

  for (let i = 0; i < amount; i += 1) {
    tasks.push(
      ensureAsset(assetFactory, {
        userPk,
        userDid,
        type,
        name,
        svg,
        description: desc || name,
        location: loc || 'China',
        backgroundUrl: bg || '',
        logoUrl: logo || 'https://releases.arcblockio.cn/arcblock-logo.png',
        startTime: start || new Date(),
        endTime: end || new Date(Date.now() + 2 * 60 * 60 * 1000),
      })
    );
  }

  const assets = await Promise.all(tasks);
  return assets;
};

const getTransactionAssetType = type => (type === 'token' ? 'tokens' : 'assets');

const getTransferSig = async ({
  userPk,
  userDid,
  ra,
  rt,
  name,
  desc,
  start,
  end,
  bg,
  logo,
  loc,
  locale = 'en',
  svg,
}) => {
  const [assets] = await getAssets({
    amount: ra,
    type: rt,
    userPk,
    userDid,
    name,
    desc,
    start,
    end,
    bg,
    logo,
    loc,
    svg,
  });
  const description = {
    en: `Sign this text to get ${upperFirst(rt)} asset`,
    zh: `签名该文本，你将获得 ${upperFirst(rt)} 资产`,
  };

  return {
    description: description[locale],
    data: JSON.stringify(assets.address),
    type: 'mime:text/plain',
    display: JSON.stringify(assets.data.value.credentialSubject.display),
  };
};

const getExchangeSig = async ({ userPk, userDid, pa, pt, ra, rt, name, desc, start, end, bg, logo, loc, svg }) => {
  let senderPayload = null;
  let receiverPayload = null;

  if (pt === 'token') {
    senderPayload = [{ address: env.foreignTokenId, value: (await client.fromTokenToUnit(pa)).toString() }];
  } else {
    const assets = await getTransferrableAssets(userDid);
    senderPayload = assets
      .filter(item => transferVCTypeToAssetType(JSON.parse(item.data.value).type) === NFTType[pt])
      .map(item => item.address)
      .slice(0, pa);

    if (senderPayload.length < pa) {
      throw new Error('Not sufficient Assets');
    }
  }

  if (rt === 'token') {
    receiverPayload = [{ address: env.foreignTokenId, value: (await client.fromTokenToUnit(ra)).toString() }];
  } else {
    const assets = await getAssets({
      amount: ra,
      type: rt,
      userPk,
      userDid,
      name,
      desc,
      start,
      end,
      bg,
      logo,
      loc,
      svg,
    });
    receiverPayload = assets.map(asset => asset.address);
  }

  const tx = await client.signExchangeV2Tx({
    tx: {
      itx: {
        to: userDid,
        sender: {
          [getTransactionAssetType(rt)]: receiverPayload,
        },
        receiver: {
          [getTransactionAssetType(pt)]: senderPayload,
        },
      },
    },
    wallet,
  });

  tx.signaturesList.push({
    pk: fromBase58(userPk),
    signer: userDid,
  });

  logger.info('swap_asset.claims.signed', tx);

  return {
    type: 'ExchangeV2Tx',
    data: tx,
    description: 'swap_asset between assets and secondary token',
  };
};

const transferAsset = async ({ claim, userDid, userPk }) => {
  try {
    logger.info('swap_asset.onAuth', { claim, userDid });
    const type = toTypeInfo(userDid);
    const user = fromPublicKey(userPk, type);

    if ((await user.verify(claim.origin, claim.sig)) === false) {
      throw new Error('签名错误');
    }

    const asset = JSON.parse(fromBase58(claim.origin));
    const hash = await client.sendTransferV2Tx({
      tx: {
        itx: {
          to: userDid,
          assets: [asset],
        },
      },
      wallet,
    });

    logger.info('swap_asset.onAuth', hash);
    return { hash, tx: claim.origin };
  } catch (err) {
    logger.info('swap_asset.onAuth.error', err);
    throw new Error('交易失败', err.message);
  }
};

const exchangeAsset = async claim => {
  const tx = client.decodeTx(claim.origin);

  tx.signaturesList[0].signature = claim.sig;

  if (claim.from) {
    tx.signaturesList[0].signer = claim.from;
  }

  if (claim.delegator) {
    tx.signaturesList[0].delegator = claim.delegator;
  }

  const hash = await client.exchange({
    tx,
    wallet,
  });

  logger.info('swap_asset tx hash:', hash);
  return { hash, tx: claim.origin };
};

/**
 * pa => pay amount
 * pt => pay type
 * ra => receive amount
 * rt => receive type
 *
 * action => buy/sell
 * type =>
 */
module.exports = {
  action: 'swap_asset_v2',
  claims: {
    signature: async ({
      userPk,
      userDid,
      extraParams: { pa = 1, pt, ra = 1, rt, name, desc, start, end, bg, logo, svg, loc, locale = 'en' },
    }) => {
      if (!name) {
        throw new Error('Cannot buy/sell asset without a valid name');
      }

      if (pt !== 'token' && NFTType[pt] === undefined) {
        throw new Error(`Invalid asset type: ${pt}`);
      }

      if (rt !== 'token' && NFTType[rt] === undefined) {
        throw new Error(`Invalid asset type: ${rt}`);
      }

      try {
        if (pt === 'token' && Number(pa) === 0) {
          const sig = await getTransferSig({
            userPk,
            userDid,
            ra,
            rt,
            name,
            desc,
            start,
            end,
            bg,
            logo,
            svg,
            loc,
            locale,
          });
          return sig;
        }

        const sig = await getExchangeSig({
          userPk,
          userDid,
          pa,
          pt,
          ra,
          rt,
          name,
          desc,
          start,
          end,
          bg,
          logo,
          svg,
          loc,
        });
        return sig;
      } catch (error) {
        logger.info('swap_asset.generate_exchange.error:');
        logger.info(error);

        throw new Error(`swap_asset failed: ${error.message}`);
      }
    },
  },
  onAuth: async ({ claims, userDid, userPk }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      logger.info('swap_asset.auth.claim', claim);

      if (claim.typeUrl === 'mime:text/plain') {
        const tx = await transferAsset({ claim, userDid, userPk });
        return tx;
      }

      const tx = await exchangeAsset(claim);
      return tx;
    } catch (err) {
      logger.info('swap_asset.error:');
      logger.info(err);

      throw new Error(`swap_asset failed: ${err.message}`);
    }
  },
};
