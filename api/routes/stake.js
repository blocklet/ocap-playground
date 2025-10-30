const { authMiddleware } = require('@blocklet/sdk/lib/middlewares/auth');
const { toBN, fromUnitToToken } = require('@ocap/util');
const { client, wallet } = require('../libs/auth');

module.exports = {
  init(app) {
    app.get('/api/stakes/claimable', authMiddleware(), async (req, res) => {
      try {
        const userDid = req.user.did;
        const { transactions } = await client.listTransactions({
          accountFilter: { accounts: [userDid] },
          typeFilter: { types: ['revoke_stake'] },
          validityFilter: { validity: 'VALID' },
          paging: { size: 100 },
        });

        const results = await Promise.all(
          transactions
            .filter(x => x.time > '2021-11-03T00:00:00.000Z')
            .map(async x => {
              const { state } = await client.getEvidenceState({ hash: x.hash });
              if (state) {
                return false;
              }

              return x;
            })
        );

        return res.jsonp(results.filter(Boolean));
      } catch (e) {
        return res.jsonp([]);
      }
    });

    app.post('/api/stakes/slash/:type', authMiddleware(), async (req, res) => {
      const zero = toBN(0);
      const filters = {
        token: list => list.some(t => toBN(t.balance).gt(zero)),
        asset: list => list.length > 0,
        both: list => filters.token(list) || filters.asset(list),
      };
      if (!filters[req.params.type]) {
        return res.json({ error: 'invalid slash type' });
      }

      try {
        const userDid = req.user.did;
        const { state } = await client.getForgeState({});
        const { stakes } = await client.listStakes({
          addressFilter: { sender: userDid },
          paging: { size: 100 },
        });

        let stake;
        if (req.params.type === 'token') {
          stake = stakes.find(x => filters[req.params.type](x.tokens) || filters[req.params.type](x.revokedTokens));
        } else if (req.params.type === 'asset') {
          stake = stakes.find(x => filters[req.params.type](x.assets) || filters[req.params.type](x.revokedAssets));
        } else {
          stake = stakes.find(
            x =>
              (filters[req.params.type](x.assets) || filters[req.params.type](x.revokedAssets)) &&
              (filters[req.params.type](x.tokens) || filters[req.params.type](x.revokedTokens))
          );
        }

        if (!stake) {
          return res.json({ error: `no stake for ${req.query.action} ${req.params.type}` });
        }

        const assets = [...stake.assets, ...stake.revokedAssets];
        const tokens = [...stake.tokens, ...stake.revokedTokens]
          .filter(t => +fromUnitToToken(t.balance, t.decimal) > 0)
          .sort((t1, t2) => {
            return +fromUnitToToken(t1.balance, t1.decimal) - +fromUnitToToken(t2.balance, t2.decimal);
          });

        const method = req.query.action === 'slash' ? 'sendSlashStakeTx' : 'sendReturnStakeTx';
        const receiver = req.query.action === 'slash' ? state.vaults.slashedStake : stake.sender;

        const itx = { address: stake.address, message: `${req.query.action}-test`, outputs: [] };
        if (req.params.type === 'token') {
          itx.outputs.push({
            owner: receiver,
            tokens: [{ address: tokens[0].address, value: tokens[0].balance }],
          });
        } else if (req.params.type === 'asset') {
          itx.outputs.push({
            owner: receiver,
            assets: [assets[0]],
          });
        } else {
          itx.outputs.push({
            owner: receiver,
            tokens: [{ address: tokens[0].address, value: tokens[0].balance }],
            assets: [assets[0]],
          });
        }

        const hash = await client[method]({ tx: { itx }, wallet });

        return res.jsonp({ hash });
      } catch (e) {
        console.error(e);
        return res.jsonp([]);
      }
    });
  },
};
