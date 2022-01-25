const { client } = require('../libs/auth');

module.exports = {
  init(app) {
    app.get('/api/stakes/claimable', async (req, res) => {
      if (!req.user) {
        return res.jsonp({ error: 'Please login to get your claimable stakes' });
      }

      try {
        const userDid = req.user.did;
        const { transactions } = await client.listTransactions({
          accountFilter: { accounts: [userDid] },
          typeFilter: { types: 'revoke_stake' },
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
  },
};
