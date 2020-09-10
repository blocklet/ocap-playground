const path = require('path');
const { EventEmitter } = require('events');
const util = require('util');
const DataStore = require('nedb');

class BaseState extends EventEmitter {
  constructor(baseDir, options) {
    super();
    const dbOptions = options.db || {};
    this.filename = path.join(baseDir, options.filename);
    this.db = new DataStore({
      filename: this.filename,
      timestampData: true,
      autoload: true,
      ...dbOptions,
    });

    this.asyncDB = new Proxy(this.db, {
      get(target, property) {
        return util.promisify(target[property]).bind(target);
      },
    });
  }
}

module.exports = BaseState;
