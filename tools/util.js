require('dotenv').config();

const ForgeSDK = require('@arcblock/forge-sdk');

const { fromSecretKey } = ForgeSDK.Wallet;
const { bytesToHex, isHexStrict, fromBase64 } = ForgeSDK.Util;

function ensureModeratorSecretKey() {
  const sk = process.env.FORGE_MODERATOR_SK;
  if (!sk) {
    console.error('please set FORGE_MODERATOR_SK to continue');
    process.exit(1);
  }

  if (isHexStrict(sk)) {
    return sk;
  }

  return bytesToHex(Buffer.from(fromBase64(sk)));
}

function ensureModerator() {
  const sk = ensureModeratorSecretKey();
  const moderator = fromSecretKey(sk);
  return moderator;
}

exports.ensureModerator = ensureModerator;
exports.ensureModeratorSecretKey = ensureModeratorSecretKey;
