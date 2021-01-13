/* eslint-disable no-underscore-dangle */
const BaseState = require('./base');

class UserState extends BaseState {
  constructor(options = {}) {
    super(process.env.BLOCKLET_DATA_DIR || './', { filename: 'users.db', ...options });
  }

  async insert(user) {
    return this.asyncDB.insert(user);
  }

  async update(user) {
    return this.asyncDB.update({ _id: user._id }, { $set: user });
  }

  async findOne(condition) {
    return this.asyncDB.findOne(condition);
  }
}

module.exports = UserState;
