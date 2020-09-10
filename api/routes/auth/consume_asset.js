/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { NFTType } = require('@arcblock/nft/lib/enum');
const { wallet } = require('../../libs/auth');
const { PFC } = require('../../libs/constant');
const { transferVCTypeToAssetType } = require('../../libs/util');
const env = require('../../libs/env');

const app = ForgeSDK.Wallet.fromJSON(wallet);

const getChainConnection = pfc => (pfc === PFC.local ? env.chainId : env.assetChainId);

const checkParams = ({ pfc, type }) => {
  if (!PFC[pfc]) {
    throw new Error('Invalid pay from chain param');
  }

  if (type && NFTType[type] === undefined) {
    throw new Error('Invalid asset type');
  }
};

/**
 * pfc => pay from chain
 * tu => typeUrl
 */
module.exports = {
  action: 'consume_asset',
  claims: {
    // eslint-disable-next-line object-curly-newline
    signature: async ({ userDid, userPk, extraParams: { pfc, type, tu, name, did } }) => {
      checkParams({ pfc, type });

      const conn = getChainConnection(pfc);
      let { assets } = await ForgeSDK.listAssets({ ownerAddress: userDid }, { conn });
      assets = assets.filter(x => x.consumedTime === '');

      let asset = null;
      if (did) {
        asset = assets.find(x => x.address === did);
      } else {
        asset = assets.find(x => {
          const conditions = [];
          if (name) {
            conditions.push(x.moniker === name);
          }

          if (tu) {
            conditions.push(x.data.typeUrl === tu);
          }
          console.info(`type: ${type}`);
          console.info(`type: ${x.data.typeUrl}`);

          if ((typeof type === 'string' && type !== '') || type) {
            if (x.data.typeUrl === 'vc' && x.data.value) {
              const value = JSON.parse(x.data.value);
              console.info(`result: ${transferVCTypeToAssetType(value.type)}`);
              conditions.push(transferVCTypeToAssetType(value.type) === NFTType[type]);
            } else {
              conditions.push(false);
            }
          }

          if (conditions.length === 0) {
            return false;
          }

          return conditions.reduce((acc, cur) => cur && acc, true);
        });
      }

      if (!asset) {
        throw new Error('You have no matching asset to consume!');
      }

      logger.info(`about to consume ${type}`, asset);
      const tx = await ForgeSDK.signConsumeAssetTx(
        {
          tx: { itx: { issuer: wallet.address, address: asset.address } },
          wallet: app,
        },
        { conn }
      );

      tx.signaturesList = [
        {
          pk: userPk,
          signer: userDid,
          delegator: '',
          data: {
            typeUrl: 'fg:x:address',
            value: Uint8Array.from(Buffer.from(asset.address)),
          },
        },
      ];

      return {
        type: 'ConsumeAssetTx',
        data: tx,
        description: `Sign this transaction to confirm the ${asset.moniker} consumption`,
        chainInfo: {
          host: pfc === 'local' ? env.chainHost : env.assetChainHost,
          id: pfc === 'local' ? env.chainId : env.assetChainId,
        },
      };
    },
  },
  onAuth: async ({ claims, userDid, extraParams: { pfc } }) => {
    try {
      const claim = claims.find(x => x.type === 'signature');
      logger.info('consume_asset.auth.claim', claim);

      const tx = ForgeSDK.decodeTx(claim.origin);
      const signer = tx.signaturesList.find(x => x.signer === userDid);
      if (!signer) {
        throw new Error('Multisig is invalid');
      }

      signer.signature = claim.sig;
      logger.info('consume_asset.auth.tx', tx);
      const hash = await ForgeSDK.sendConsumeAssetTx({ tx, wallet: app }, { conn: getChainConnection(pfc) });
      logger.info('hash:', hash);
      return { hash, tx: claim.origin };
    } catch (err) {
      logger.info(err.errors);
      throw err;
    }
  },
};
