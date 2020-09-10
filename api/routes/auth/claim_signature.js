/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const Mcrypto = require('@arcblock/mcrypto');
const { toTypeInfo } = require('@arcblock/did');

const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');
const { getRandomMessage } = require('../../libs/util');

const data = 'abcdefghijklmnopqrstuvwxyz'.repeat(32);
const hasher = Mcrypto.getHasher(Mcrypto.types.HashType.SHA3);

module.exports = {
  action: 'claim_signature',
  claims: {
    signature: async ({ userDid, userPk, extraParams: { type } }) => {
      const encoded = await ForgeSDK.encodeTransferTx(
        {
          tx: {
            itx: {
              to: wallet.address,
              value: await ForgeSDK.fromTokenToUnit(1),
            },
          },
          wallet: ForgeSDK.Wallet.fromPublicKey(userPk),
        },
        { conn: env.chainId }
      );
      const origin = ForgeSDK.Util.toBase58(encoded.buffer);
      console.log({ encoded, origin });

      const params = {
        transaction: {
          type: 'DeclareTx',
          data: {
            itx: { moniker: 'wangshijun' },
          },
        },

        text: {
          type: 'mime:text/plain',
          data: getRandomMessage(),
        },

        html: {
          type: 'mime:text/html',
          data: `<div>
  <h2>This is title</h2>
  <ul>
    <li>User DID: ${userDid}</li>
    <li>User PK: ${userPk}</li>
    <li>Random: ${Math.random()}</li>
  </ul>
</div>`,
        },

        // If we request user to sign some sensitive data or large piece of data
        // We should ask wallet to sign the hash of the data
        // NOTE: this should fail in latest ABT Wallet
        digest: {
          // A developer should convert the hash of his data to base58 format => digest
          digest: ForgeSDK.Util.toBase58(hasher(data, 1)),
        },

        // NOTE: this should fail in latest ABT Wallet
        evil_digest: {
          digest: ForgeSDK.Util.toBase58(hasher(origin, 1)),
          meta: { origin },
        },

        // NOTE: this should fail in latest ABT Wallet
        evil_text: {
          data: hasher(origin, 1),
          meta: { origin },
        },

        // NOTE: this should fail in latest ABT Wallet
        evil_html: {
          data: hasher(origin, 1),
          meta: { origin },
        },

        // Sign the origin without hashing
        // Wallet should not throw error on this
        skip_hash: {
          data: hasher(origin, 1),
          method: 'none',
        },
      };

      if (!params[type]) {
        throw new Error(`Unsupported signature type ${type}`);
      }

      return Object.assign({ description: `Please sign the ${type}` }, params[type]);
    },
  },

  // eslint-disable-next-line consistent-return
  onAuth: async ({ userDid, userPk, claims }) => {
    const type = toTypeInfo(userDid);
    const user = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    const claim = claims.find(x => x.type === 'signature');

    logger.info('claim.signature.onAuth', { userPk, userDid, claim });

    if (claim.origin) {
      if (user.verify(claim.origin, claim.sig, claim.method !== 'none') === false) {
        throw new Error('Origin 签名错误');
      }
    }

    // We do not need to hash the data when verifying
    if (claim.digest) {
      if (user.verify(claim.digest, claim.sig, false) === false) {
        throw new Error('Digest 签名错误');
      }
    }

    if (claim.meta && claim.meta.origin) {
      const tx = ForgeSDK.decodeTx(claim.meta.origin);
      const hash = await ForgeSDK.sendTransferTx(
        {
          tx,
          wallet: user,
          signature: claim.sig,
        },
        { conn: env.chainId }
      );

      logger.info('signature.evil.onAuth', { claims, userDid, hash });
      return { hash, tx: claim.meta.origin };
    }
  },
};
