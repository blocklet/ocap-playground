/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { toStakeAddress } = require('@arcblock/did-util');
const env = require('../libs/env');
const { authClient, wallet } = require('../libs/auth');
const { getTokenInfo, getAccountBalance } = require('../libs/util');

module.exports = {
  init(app) {
    app.get('/api/did/session', async (req, res) => {
      try {
        const token = await getTokenInfo();
        if (req.user) {
          const stakeAddress = toStakeAddress(req.user.did, wallet.address);
          const [balance, { user }, { state }] = await Promise.all([
            getAccountBalance(req.user.did),
            authClient.getUser(req.user.did),
            SDK.getStakeState({ address: stakeAddress }),
          ]);
          return res.json({
            user,
            token,
            balance,
            stake: state,
          });
        }
        return res.json({
          user: null,
          token,
          balance: {},
          stake: null,
        });
      } catch (e) {
        console.error('get session failed', e);
        return res.json({});
      }
    });

    app.get('/api/env', (req, res) => {
      res.type('js');
      res.send(`window.env = ${JSON.stringify(env, null, 2)}`);
    });
  },
};
