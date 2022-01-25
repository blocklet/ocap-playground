/* eslint-disable no-console */
const Mcrypto = require('@ocap/mcrypto');
const { toTypeInfo } = require('@arcblock/did');
const { toBase58 } = require('@ocap/util');
const { fromPublicKey } = require('@ocap/wallet');

const env = require('../../libs/env');
const { wallet, client } = require('../../libs/auth');
const { getRandomMessage } = require('../../libs/util');

const data = 'abcdefghijklmnopqrstuvwxyz'.repeat(32);
const hasher = Mcrypto.getHasher(Mcrypto.types.HashType.SHA3);

module.exports = {
  action: 'claim_signature',
  claims: {
    signature: async ({ userDid, userPk, extraParams: { type } }) => {
      const encoded = await client.encodeTransferV2Tx({
        tx: {
          itx: {
            to: wallet.address,
            tokens: [
              {
                address: env.localTokenId,
                value: (await client.fromTokenToUnit(1)).toString(),
              },
            ],
          },
        },
        wallet: fromPublicKey(userPk),
      });
      const origin = toBase58(encoded.buffer);
      console.log({ encoded, origin });

      const params = {
        transaction: {
          type: 'fg:t:transaction',
          data: origin,
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
        // NOTE: this should fail in latest DID Wallet
        digest: {
          // A developer should convert the hash of his data to base58 format => digest
          digest: toBase58(hasher(data, 1)),
        },

        // NOTE: this should fail in latest DID Wallet
        evil_digest: {
          digest: toBase58(hasher(origin, 1)),
          meta: { origin },
        },

        // NOTE: this should fail in latest DID Wallet
        evil_text: {
          data: hasher(origin, 1),
          meta: { origin },
        },

        // NOTE: this should fail in latest DID Wallet
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
    const user = fromPublicKey(userPk, type);
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
      const tx = client.decodeTx(claim.meta.origin);
      const hash = await client.sendTransferV2Tx({
        tx,
        wallet: user,
        signature: claim.sig,
      });

      logger.info('signature.evil.onAuth', { claims, userDid, hash });
      return { hash, tx: claim.meta.origin };
    }
  },
};
