const middlewares = require('@blocklet/sdk/lib/middlewares');
const { toBN, fromUnitToToken } = require('@ocap/util');
const { client, wallet } = require('../libs/auth');

module.exports = {
  init(app) {
    app.get('/api/stakes/claimable', middlewares.auth(), async (req, res) => {
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

    app.post('/api/stakes/slash/:type', middlewares.auth(), async (req, res) => {
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
          return res.json({ error: `no stake for slashing ${req.params.type}` });
        }

        const assets = [...stake.assets, ...stake.revokedAssets];
        const tokens = [...stake.tokens, ...stake.revokedTokens].sort((a, b) => {
          return +fromUnitToToken(a.balance, a.decimal) - +fromUnitToToken(b.balance, b.decimal);
        });

        const itx = { address: stake.address, message: 'slash-test', outputs: [] };
        if (req.params.type === 'token') {
          itx.outputs.push({
            owner: state.vaults.slashedStake,
            tokens: [{ address: tokens[0].address, value: tokens[0].balance }],
          });
        } else if (req.params.type === 'asset') {
          itx.outputs.push({
            owner: state.vaults.slashedStake,
            assets: [assets[0]],
          });
        } else {
          itx.outputs.push({
            owner: state.vaults.slashedStake,
            tokens: [{ address: tokens[0].address, value: tokens[0].balance }],
            assets: [assets[0]],
          });
        }

        const hash = await client.sendSlashStakeTx({ tx: { itx }, wallet });

        return res.jsonp({ hash });
      } catch (e) {
        console.error(e);
        return res.jsonp([]);
      }
    });
  },
};
