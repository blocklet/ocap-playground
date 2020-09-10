const ForgeSDK = require('@arcblock/forge-sdk');
const BaseState = require('./base');

const DEFAULT_EXPIRE_TIME = 10 * 60 * 1000;

class VerificationToken extends BaseState {
  constructor(options = {}) {
    super(process.env.BLOCKLET_DATA_DIR || './', { filename: 'tokens.db', ...options });
  }

  async insert(verification) {
    return this.asyncDB.insert(verification);
  }

  async findOne(condition, projection) {
    return this.asyncDB.findOne(condition, { privateKey: 0, ...(projection || {}) });
  }

  async generate(userDid) {
    const random = ForgeSDK.Wallet.fromRandom();
    const token = random.publicKey.replace(/^0x/, '').toUpperCase();
    const item = { userDid, token, createdAt: new Date() };
    await this.insert(item);
    return token;
  }

  async verify(token, options = {}) {
    const timeout = options.timeout || DEFAULT_EXPIRE_TIME;

    if (!token || !ForgeSDK.Util.isHex(token)) {
      throw new Error('Invalid verification token');
    }

    const item = await this.asyncDB.findOne({ token });
    if (!item) {
      throw new Error('Verification token not found');
    }

    if (item.expired) {
      throw new Error('Verification token expired');
    }

    if (+new Date() > +item.createdAt + timeout) {
      item.expired = true;
      item.expiredAt = new Date();
      await this.insert(item);
      throw new Error('Verification token expired');
    }

    if (item.verified) {
      throw new Error('Verification token used');
    }

    item.verified = true;
    item.verifiedAt = new Date();
    await this.insert(item);
    return item.toJSON();
  }
}

module.exports = VerificationToken;
