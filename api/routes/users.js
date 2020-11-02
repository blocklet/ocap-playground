const { VerificationToken, User } = require('../models');

module.exports = {
  init(app) {
    app.get('/api/users', async (req, res) => {
      if (!req.user || req.user.role === 'none') {
        return res.jsonp([]);
      }

      const conditions = {};
      if (global.isProduction) {
        conditions.verified = true;
      }
      const users = await User.find(conditions);
      return res.jsonp(users.map(x => x.toJSON()));
    });

    // eslint-disable-next-line consistent-return
    app.get('/api/users/verify/:token', async (req, res) => {
      try {
        const result = await VerificationToken.verify(req.params.token);

        const user = await User.findOne({ did: result.userDid });
        if (!user) {
          throw new Error('User not found');
        }

        user.emailVerified = true;
        user.updatedAt = new Date();
        await User.insert(user);

        logger.info('user.verify.success', req.params, result);
        return res.json('verification success');
      } catch (err) {
        logger.error('user.verify.error', req.params);
        res.status(400).send(err.message);
      }
    });
  },
};
