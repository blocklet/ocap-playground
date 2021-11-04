const SDK = require('@ocap/sdk');

module.exports = {
  init(app) {
    app.get('/api/stakes/claimable', async (req, res) => {
      if (!req.user) {
        return res.jsonp({ error: 'Please login to get your claimable stakes' });
      }

      try {
        const userDid = req.user.did;
        const { transactions } = await SDK.listTransactions({
          accountFilter: { accounts: [userDid] },
          typeFilter: { types: 'revoke_stake' },
          validityFilter: { validity: 'VALID' },
          paging: { size: 100 },
        });

        const results = await Promise.all(
          transactions.map(async x => {
            const { state } = await SDK.getEvidenceState({ hash: x.hash });
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
