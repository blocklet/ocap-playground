const env = require('../libs/env');
const { getTokenInfo, getAccountBalance } = require('../libs/util');

module.exports = {
  init(app) {
    app.get('/api/did/session', async (req, res) => {
      try {
        const token = await getTokenInfo();
        if (req.user) {
          const balance = await getAccountBalance(req.user.did);
          return res.json({
            user: req.user,
            token,
            balance,
          });
        }
        return res.json({
          user: req.user,
          token,
          balance: {},
        });
      } catch (e) {
        return res.json({});
      }
    });

    app.get('/api/env', (req, res) => {
      res.type('js');
      res.send(`window.env = ${JSON.stringify(env, null, 2)}`);
    });
  },
};
