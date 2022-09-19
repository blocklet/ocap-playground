/* eslint-disable no-console */
// const { HashType } = require('@ocap/client');
// const { hexToBytes } = require('@ocap/util');
const { providers, utils, Contract } = require('ethers');
const ethUtil = require('ethereumjs-util');
const { fromRpcSig, ecrecover, toBuffer, bufferToHex, publicToAddress } = require('ethereumjs-util');
const { TypedDataUtils } = require('eth-sig-util');

const Mcrypto = require('@ocap/mcrypto');
const { utf8ToHex } = require('@ocap/util');
const { toBase58 } = require('@ocap/util');

// const Web3 = require('Web3');

// eslint-disable-next-line no-unused-vars
const SUPPORTED_CHAINS = [
  {
    name: 'Ethereum Mainnet',
    short_name: 'eth',
    chain: 'ETH',
    network: 'mainnet',
    chain_id: 1,
    network_id: 1,
    rpc_url: 'https://mainnet.infura.io/v3/%API_KEY%',
    native_currency: {
      symbol: 'ETH',
      name: 'Ether',
      decimals: '18',
      contractAddress: '',
      balance: '',
    },
  },
  {
    name: 'Ethereum Ropsten',
    short_name: 'rop',
    chain: 'ETH',
    network: 'ropsten',
    chain_id: 3,
    network_id: 3,
    rpc_url: 'https://ropsten.infura.io/v3/%API_KEY%',
    native_currency: {
      symbol: 'ETH',
      name: 'Ether',
      decimals: '18',
      contractAddress: '',
      balance: '',
    },
  },
  {
    name: 'Ethereum Rinkeby',
    short_name: 'rin',
    chain: 'ETH',
    network: 'rinkeby',
    chain_id: 4,
    network_id: 4,
    rpc_url: 'https://rinkeby.infura.io/v3/%API_KEY%',
    native_currency: {
      symbol: 'ETH',
      name: 'Ether',
      decimals: '18',
      contractAddress: '',
      balance: '',
    },
  },
];

const spec = {
  magicValue: '0x1626ba7e',
  abi: [
    {
      constant: true,
      inputs: [
        {
          name: '_hash',
          type: 'bytes32',
        },
        {
          name: '_sig',
          type: 'bytes',
        },
      ],
      name: 'isValidSignature',
      outputs: [
        {
          name: 'magicValue',
          type: 'bytes4',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ],
};

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

const encodeTypedDataMsg = msg => {
  const data = TypedDataUtils.sanitizeData(JSON.parse(msg));
  const buf = Buffer.concat([
    Buffer.from('1901', 'hex'),
    TypedDataUtils.hashStruct('EIP712Domain', data.domain, data.types),
    TypedDataUtils.hashStruct(data.primaryType, data.message, data.types),
  ]);
  return ethUtil.bufferToHex(buf);
};

const hashTypedDataMessage = msg => {
  const data = encodeTypedDataMsg(msg);
  const buf = ethUtil.toBuffer(data);
  const hash = ethUtil.keccak256(buf);
  return ethUtil.bufferToHex(hash);
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

function recoverAddress(sig, hash) {
  const params = fromRpcSig(sig);
  const result = ecrecover(toBuffer(hash), params.v, params.r, params.s);
  const signer = bufferToHex(publicToAddress(result));
  return signer;
}

async function isValidSignature(address, sig, data, provider, abi, magicValue) {
  let returnValue;
  try {
    returnValue = await new Contract(address, abi, provider).isValidSignature(utils.arrayify(data), sig);
  } catch (e) {
    return false;
  }
  return returnValue.toLowerCase() === magicValue.toLowerCase();
}

const eip1271 = {
  spec,
  isValidSignature,
};

async function verifySignature(address, sig, hash) {
  // const checkChain = SUPPORTED_CHAINS.filter(chain => chain.chain_id === chainId);
  const rpcUrl = 'https://rinkeby.infura.io/v3/7feb76462cf7419ea41845147456947c';
  const provider = new providers.JsonRpcProvider(rpcUrl);
  const bytecode = await provider.getCode(address);
  if (!bytecode || bytecode === '0x' || bytecode === '0x0' || bytecode === '0x00') {
    const signer = recoverAddress(sig, hash);
    return signer.toLowerCase() === address.toLowerCase();
  }
  return eip1271.isValidSignature(address, sig, hash, provider);
}

const message = 'My email is john@doe.com - Fri, 26 Aug 2022 13:57:57 GMT';
module.exports = {
  action: 'eth_sign',
  claims: {
    signature: async ({ userDid, extraParams: { type } }) => {
      // const description = 'Please sign this message';
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
        eth_legacy_data: {
          type: 'eth:legacy-data',
          data: JSON.stringify({
            network: 4,
            address: userDid,
            data: hashMessage(message),
          }),
        },
        eth_typed_data: {
          type: 'eth:typed-data',
          data: JSON.stringify({
            network: 4,
            address: userDid,
            data: JSON.stringify(example),
          }),
        },
        eth_personal_sign: {
          type: 'eth:personal-data',
          data: JSON.stringify({
            network: 4,
            address: userDid,
            data: hexMessage,
          }),
        },
        eth_standard_data: {
          type: 'eth:standard-data',
          data: JSON.stringify({
            network: 4,
            address: userDid,
            data: hexMessage,
          }),
        },
        eth_tx: {
          type: 'eth:transaction',

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
    const claim = claims.find(x => x.type === 'signature');
    const { sig } = claim;

    // const data = fromBase58(claim.origin)
    console.info(`signature: ${sig}`);
    if (claim.typeUrl === 'eth:typed-data') {
      const tmessage = JSON.stringify(example);
      const hash = hashTypedDataMessage(tmessage);
      const valid = await verifySignature(userDid, sig, hash, 4);
      if (!valid) throw Error('message signature wrong!');
    } else {
      const hashMsg = hashMessage(message);
      const isValid = await verifySignature(userDid, sig, hashMsg, 4);
      if (!isValid) throw Error('message signature wrong!');
    }
  },
};
