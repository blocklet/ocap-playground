// const { HashType } = require('@ocap/client');
// const { hexToBytes } = require('@ocap/util');
const Mcrypto = require('@ocap/mcrypto');
const { utf8ToHex } = require('@ocap/util');
const { toBase58 } = require('@ocap/util');

// const Web3 = require('Web3');

const example = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'verifyingContract', type: 'address' },
    ],
    RelayRequest: [
      { name: 'target', type: 'address' },
      { name: 'encodedFunction', type: 'bytes' },
      { name: 'gasData', type: 'GasData' },
      { name: 'relayData', type: 'RelayData' },
    ],
    GasData: [
      { name: 'gasLimit', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'pctRelayFee', type: 'uint256' },
      { name: 'baseRelayFee', type: 'uint256' },
    ],
    RelayData: [
      { name: 'senderAddress', type: 'address' },
      { name: 'senderNonce', type: 'uint256' },
      { name: 'relayWorker', type: 'address' },
      { name: 'paymaster', type: 'address' },
    ],
  },
  domain: {
    name: 'GSN Relayed Transaction',
    version: '1',
    chainId: 42,
    verifyingContract: '0x6453D37248Ab2C16eBd1A8f782a2CBC65860E60B',
  },
  primaryType: 'RelayRequest',
  message: {
    target: '0x9cf40ef3d1622efe270fe6fe720585b4be4eeeff',
    encodedFunction:
      '0xa9059cbb0000000000000000000000002e0d94754b348d208d64d52d78bcd443afa9fa520000000000000000000000000000000000000000000000000000000000000007',
    gasData: { gasLimit: '39507', gasPrice: '1700000000', pctRelayFee: '70', baseRelayFee: '0' },
    relayData: {
      senderAddress: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b',
      senderNonce: '3',
      relayWorker: '0x3baee457ad824c94bd3953183d725847d023a2cf',
      paymaster: '0x957F270d45e9Ceca5c5af2b49f1b5dC1Abb0421c',
    },
  },
};

const hexToBuffer = hex => {
  return Buffer.from(hex, 'hex');
};

const convertUtf8ToHex = str => {
  return utf8ToHex(str);
};

const encodePersonalMessage = msg => {
  const data = hexToBuffer(convertUtf8ToHex(msg));
  const buf = Buffer.concat([Buffer.from(`\u0019Ethereum Signed Message:\n${data.length.toString()}`, 'utf8'), data]);
  return buf.toString('hex');
};

const hashMessage = msg => {
  const data = encodePersonalMessage(msg);
  const buf = hexToBuffer(data);
  const hasher = Mcrypto.getHasher(Mcrypto.types.HashType.KECCAK);
  const hash = hasher(buf, 1);
  return hash.toString('hex');
};

module.exports = {
  action: 'eth_sign',
  claims: {
    signature: async ({ userDid, extraParams: { type } }) => {
      // const description = 'Please sign this message';
      const message = `My email is john@doe.com - ${new Date().toUTCString()}`;
      const hexMessage = utf8ToHex(message);
      const txString = JSON.stringify({
        network: 4,
        tx: {
          to: '0x162e56f12ba101dBcA8b90Afe45FA24B08C233D3',
          value: '1000000000000000',
          gasLimit: '80000',
          data: '',
        },
      });
      const origin = toBase58(Buffer.from(txString, 'utf-8'));
      const params = {
        eth_typed_data: {
          type: 'eth:typed-data',
          address: userDid,
          data: example,
        },
        eth_personal_sign: {
          type: 'eth:personal-data',
          address: userDid,
          data: hexMessage,
        },
        eth_standard_data: {
          type: 'eth:standard-data',
          address: userDid,
          data: hashMessage(message),
        },
        eth_tx: {
          type: 'eth:transaction',
          address: userDid,
          data: origin,
        },
      };
      
      if (!params[type]) {
        throw new Error(`Unsupported signature type ${type}`);
      }

      return Object.assign({ description: `Please sign the ${type}` }, params[type]);
    },
  },
  onAuth: async ({ claims, userDid, extraParams: { locale } }) => {
    logger.info('eth.onAuth', { claims, userDid, locale });
  },
};
