const Notification = require('@blocklet/sdk/service/notification');
const SDK = require('@ocap/sdk');
const ForgeWallet = require('@ocap/wallet');
const Mcrypto = require('@ocap/mcrypto');
const { fromTokenToUnit } = require('@ocap/util');
const { create } = require('@arcblock/vc');

const { wallet, authClient, factory: assetFactory } = require('../libs/auth');
const env = require('../libs/env');
const { ensureAsset } = require('../libs/util');
const itx = require('../libs/token');

const hasher = Mcrypto.getHasher(Mcrypto.types.HashType.SHA3);

module.exports = {
  init(app) {
    app.post('/api/notification', async (req, res) => {
      const { type, content: { title, body }, actions = [] } = req.body.data;
      const userDid = req.user && req.user.did;

      try {
        // token
        if (type === 'token') {
          // send secondary token
          const amount = Math.random().toFixed(6);
          await SDK.transfer({
            to: userDid,
            token: 0,
            tokens: [{ address: env.tokenId, value: amount }],
            wallet: SDK.Wallet.fromJSON(wallet),
          });

          await Notification.sendToUser(userDid, {
            title,
            body,
            attachments: [{
              type,
              data: {
                address: itx.address,
                amount: fromTokenToUnit(amount).toString(),
                symbol: itx.symbol,
                senderDid: env.appId,
                chainHost: env.chainHost,
              },
            }],
            actions,
          });

          res.status(200).end();
          return;
        }

        // vc
        if (type === 'vc') {
          const { user: vt } = await authClient.getUser(userDid);

          const w = ForgeWallet.fromRandom();
          const emailDigest = hasher(vt.email, 1);
          const vc = create({
            type: 'EmailVerificationCredential',
            issuer: {
              wallet: w,
              name: 'ArcBlock.KYC.Email',
            },
            subject: {
              id: userDid,
              emailDigest: SDK.Util.toBase64(emailDigest),
              method: 'SHA3',
            },
          });

          await Notification.sendToUser(userDid, {
            title,
            body,
            attachments: [{
              type,
              data: {
                credential: vc,
                tag: vt.email,
              },
            }],
            actions,
          });

          res.status(200).end();
          return;
        }

        // asset
        if (type === 'asset') {
          const { user } = await authClient.getUser(userDid);

          const asset = await ensureAsset(assetFactory, {
            userPk: user.pk,
            userDid,
            type: 'badge',
            name: 'Badge',
            description: 'Badge ',
            svg: './public/static/images/badge.svg',
            location: 'China',
            backgroundUrl: '',
            logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
            startTime: new Date(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          });

          await SDK.transfer({
            to: userDid,
            assets: [asset.address],
            wallet: SDK.Wallet.fromJSON(wallet),
          });

          await Notification.sendToUser(userDid, {
            title,
            body,
            attachments: [{
              type,
              data: {
                did: asset.address,
                chainHost: env.chainHost,
              },
            }],
            actions,
          });

          res.status(200).end();
          return;
        }

        // text
        if (type === 'text') {
          const messages = {
            en: {
              title: 'Hello',
              body: 'Hello World',
            },
            zh: {
              title: '你好',
              body: '你好，世界',
            },
          };

          const { user } = await authClient.getUser(userDid);
          const locale = user.locale || 'en';
          const message = messages[locale] || messages.en;

          await Notification.sendToUser(userDid, {
            title: message.title,
            body: message.body,
            actions,
          });

          res.status(200).end();
          return;
        }

        throw new Error(`unknown type: ${type}`);
      } catch (error) {
        logger.error(error);
        res.statusMessage = error.message;
        res.status(400).end();
      }
    });
  },
};
