const { wallet, client } = require('../../libs/auth');
const factory = require('../../libs/factory');

module.exports = {
  action: 'consume-asset',
  claims: {
    signature: async ({ userDid, userPk }) => {
      const { assets } = await client.listAssets({
        factoryAddress: factory.nodePurchaseFactory.address,
        ownerAddress: userDid,
        paging: { size: 100 },
      });

      const notConsumed = assets.find(x => !x.consumedTime);
      if (!notConsumed) {
        throw new Error('You have no NodePurchaseCredential nft to consume, please purchase 1 first');
      }

      const tx = await client.encodeConsumeAssetTx({
        tx: {
          from: wallet.address,
          pk: wallet.publicKey,
          itx: {
            address: notConsumed.address,
          },
          signatures: [
            {
              signer: userDid,
              pk: userPk,
              signature: '',
            },
            {
              signer: wallet.address,
              pk: wallet.publicKey,
              signature: '',
            },
          ],
        },
        wallet,
      });

      return {
        type: 'ConsumeAssetTx',
        data: tx,
        description: 'Please sign the transaction to consume asset',
      };
    },
  },

  onAuth: async ({ userDid, claims }) => {
    const claim = claims.find(x => x.type === 'signature');
    const tx = client.decodeTx(claim.origin);
    const multiSigned = await client.multiSignConsumeAssetTx({ tx, wallet });

    const userSig = multiSigned.signaturesList.find(x => x.signer === userDid);
    userSig.signature = claim.sig;

    const signed = await client.signConsumeAssetTx({ tx: multiSigned, wallet });
    const hash = await client.sendConsumeAssetTx({ tx: signed, wallet });

    return { hash };
  },
};
