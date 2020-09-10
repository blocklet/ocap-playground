/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
const env = require('../../libs/env');
const { User } = require('../../models');
const { login } = require('../../libs/jwt');

const description = {
  en: `Login ${env.appName} with your ABT Wallet`,
  zh: `用 ABT 钱包登录 ${env.appName}`,
};

module.exports = {
  action: 'login',
  claims: {
    profile: ({ extraParams: { locale } }) => ({
      fields: ['fullName', 'email'],
      description: description[locale] || description.en,
    }),
  },
  onAuth: async ({ claims, userDid, token, storage }) => {
    try {
      const profile = claims.find(x => x.type === 'profile');
      const exist = await User.findOne({ did: userDid });
      console.log(exist);
      if (exist) {
        logger.info('update user', userDid, JSON.stringify(profile));
        exist.name = profile.fullName;
        exist.email = profile.email;
        await User.update(exist);
      } else {
        logger.info('create user', userDid, JSON.stringify(profile));
        const user = {
          did: userDid,
          name: profile.fullName,
          email: profile.email,
        };
        await User.insert(user);
      }

      // Generate new session token that client can save to localStorage
      const sessionToken = await login(userDid);
      console.log(`sessionToken:${sessionToken}`);
      await storage.update(token, { did: userDid, sessionToken });
      console.log(`sessionToken updated:${sessionToken}`);
      return {
        callbackParams: {
          loginToken: sessionToken,
        },
      };
    } catch (err) {
      console.log(err);
      logger.error('login.onAuth.error', err);
    }
  },
};
