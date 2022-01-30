const Notification = require('@blocklet/sdk/service/notification');
const Mcrypto = require('@ocap/mcrypto');
const { fromTokenToUnit, toBase64 } = require('@ocap/util');
const { fromRandom } = require('@ocap/wallet');
const { create } = require('@arcblock/vc');
const createPassportSvg = require('../libs/nft/passport');
const badgeArray = require('../libs/svg');

const { wallet, client, authClient, factory: assetFactory } = require('../libs/auth');
const env = require('../libs/env');
const { ensureAsset } = require('../libs/util');
const itx = require('../libs/token');

const hasher = Mcrypto.getHasher(Mcrypto.types.HashType.SHA3);

module.exports = {
  init(app) {
    app.post('/api/notification', async (req, res) => {
      const {
        type,
        content: { title, body },
        actions = [],
      } = req.body.data;
      const userDid = req.user && req.user.did;

      try {
        // token
        if (type === 'token') {
          // send secondary token
          const amount = Math.random().toFixed(6);
          if (actions.length === 0) {
            await client.transfer({
              to: userDid,
              token: 0,
              tokens: [{ address: env.foreignTokenId, value: amount }],
              wallet,
            });

            await Notification.sendToUser(userDid, {
              title,
              body,
              attachments: [
                {
                  type,
                  data: {
                    address: itx.address,
                    amount: fromTokenToUnit(amount).toString(),
                    symbol: itx.symbol,
                    senderDid: env.appId,
                    chainHost: env.chainHost,
                    decimal: itx.decimal,
                  },
                },
              ],
              actions,
            });
          } else if (actions[0].name === 'primary') {
            await client.transfer({
              to: userDid,
              token: amount,
              wallet,
            });

            await Notification.sendToUser(userDid, {
              title,
              body,
              attachments: [
                {
                  type,
                  data: {
                    address: env.localTokenId,
                    amount: fromTokenToUnit(amount).toString(),
                    symbol: 'TBA',
                    senderDid: env.appId,
                    chainHost: env.chainHost,
                    decimal: 18,
                  },
                },
              ],
              actions,
            });
          }
          res.status(200).end();
          return;
        }

        // vc
        if (type === 'vc') {
          const { user: vt } = await authClient.getUser(userDid);

          const w = fromRandom();
          const emailDigest = hasher(vt.email, 1);
          const vc = create({
            type: 'EmailVerificationCredential',
            issuer: {
              wallet: w,
              name: 'ArcBlock.KYC.Email',
            },
            subject: {
              id: userDid,
              emailDigest: toBase64(emailDigest),
              method: 'SHA3',
            },
          });
          const passport = { name: 'arcblocker', title: 'ArcBlocker' };
          const pp = create({
            type: ['PlaygroundFakePassport', 'NFTPassport', 'VerifiableCredential'],
            issuer: {
              wallet: w,
              name: 'Wallet Playground',
            },
            subject: {
              id: userDid,
              passport,
              display: {
                type: 'svg',
                passport,
                content: createPassportSvg({
                  issuer: 'Wallet Playground',
                  issuerDid: w.address,
                  title: passport.title,
                }),
              },
            },
          });

          await Notification.sendToUser(userDid, {
            title,
            body,
            attachments: [
              {
                type,
                data: {
                  credential: vc,
                  tag: vt.email,
                },
              },
              {
                type,
                data: {
                  credential: pp,
                  tag: passport.title,
                },
              },
            ],
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

          const asset2 = await ensureAsset(assetFactory, {
            userPk: user.pk,
            userDid,
            type: 'badge',
            name: 'Badge',
            description: 'Badge ',
            svg: badgeArray[Math.floor(Math.random() * badgeArray.length)],
            location: 'China',
            backgroundUrl: '',
            logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
            startTime: new Date(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          });

          await client.transfer({
            to: userDid,
            assets: [asset.address, asset2.address],
            wallet,
          });

          await Notification.sendToUser(userDid, {
            title,
            body,
            attachments: [
              {
                type,
                data: {
                  did: asset.address,
                  chainHost: env.chainHost,
                },
              },
              {
                type,
                data: {
                  did: asset2.address,
                  chainHost: env.chainHost,
                },
              },
            ],
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

        // feed graphic single
        if (type === 'feed-graphic-single') {
          const feedTitles = [
            'Playground 又又又有新功能上新啦，还不快来体验',
            '更多新奇好玩的功能就在这里...',
            '这里有关于 DID Connect 的一切，快来体验吧...',
            '不知道什么是 DID Connect？那就点进来试试吧...',
            '新增 Feed 流功能，赶快进来看看吧...',
            '叮咚，叮咚，新年上新，进来看看吧...',
          ];
          const feedCovers = [
            'https://www.arcblock.io/blog/static/e764f965cad5b051eea9616da31e87ce/11382/cover.jpg',
            'https://www.arcblock.io/blog/static/0cad6ff5c9f6da9ba3e6bda5754e80d4/b17e2/cover.png',
            'https://www.arcblock.io/blog/static/1a80aecdfe20302d590426a0264f4001/1eba9/cover.jpg',
            'https://www.arcblock.io/blog/static/601502c3b49551c102668fbd85828478/11382/cover.jpg',
            'https://www.arcblock.io/blog/static/edc8c8c6590ed34ab81dcae62962813f/832a6/cover.jpg',
            'https://www.arcblock.io/blog/static/3de65fca3c03276c9700f067af17e621/11382/cover.jpg',
          ];
          const randomIndex = Math.floor(Math.random() * feedTitles.length);
          await Notification.sendToUser(userDid, {
            type: 'feed',
            feedType: 'graphic',
            data: {
              cardTitle: 'Playground Promotion',
              items: [
                {
                  title: feedTitles[randomIndex],
                  cover: feedCovers[randomIndex],
                  link: 'https://www.arcblock.io',
                },
              ],
            },
          });
          res.status(200).end();
          return;
        }

        // feed graphic multi
        if (type === 'feed-graphic-multi') {
          const feedTitles = [
            'Playground 又又又有新功能上新啦，还不快来体验',
            '更多新奇好玩的功能就在这里...',
            '这里有关于 DID Connect 的一切，快来体验吧...',
            '不知道什么是 DID Connect？那就点进来试试吧...',
            '新增 Feed 流功能，赶快进来看看吧...',
            '叮咚，叮咚，新年上新，进来看看吧...',
          ];
          const feedCovers = [
            'https://www.arcblock.io/blog/static/e764f965cad5b051eea9616da31e87ce/11382/cover.jpg',
            'https://www.arcblock.io/blog/static/0cad6ff5c9f6da9ba3e6bda5754e80d4/b17e2/cover.png',
            'https://www.arcblock.io/blog/static/1a80aecdfe20302d590426a0264f4001/1eba9/cover.jpg',
            'https://www.arcblock.io/blog/static/601502c3b49551c102668fbd85828478/11382/cover.jpg',
            'https://www.arcblock.io/blog/static/edc8c8c6590ed34ab81dcae62962813f/832a6/cover.jpg',
            'https://www.arcblock.io/blog/static/3de65fca3c03276c9700f067af17e621/11382/cover.jpg',
          ];
          const randomIndex1 = Math.floor(Math.random() * feedTitles.length);
          const randomIndex2 = Math.floor(Math.random() * feedTitles.length);
          await Notification.sendToUser(userDid, {
            type: 'feed',
            feedType: 'graphic',
            data: {
              cardTitle: 'Playground Promotion',
              items: [
                {
                  title: feedTitles[randomIndex1],
                  cover: feedCovers[randomIndex1],
                  link: 'https://www.arcblock.io',
                },
                {
                  title: feedTitles[randomIndex2],
                  cover: feedCovers[randomIndex2],
                  link: 'https://www.arcblock.io',
                },
              ],
            },
          });
          res.status(200).end();
          return;
        }

        // feed-data-tracker
        if (type === 'feed-data-tracker') {
          const feedContent = ['$1111', '$2222', '$3333', '$4444', '$5555'];
          const feedSubContent = ['+10%', '+20%', '+30%', '+40%', '+50%'];
          const randomIndexETH = Math.floor(Math.random() * feedSubContent.length);
          const randomIndexABT = Math.floor(Math.random() * feedSubContent.length);
          await Notification.sendToUser(userDid, {
            type: 'feed',
            feedType: 'data-tracker',
            data: {
              cardTitle: 'Playground Token Price Tracker',
              type: 'table',
              items: [
                {
                  icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                  title: 'ETH',
                  subtitle: '',
                  content: feedContent[randomIndexETH],
                  content_color: '#222222',
                  sub_content: feedSubContent[randomIndexETH],
                  sub_content_color: '#09f4A7',
                },
                {
                  icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2545.png',
                  title: 'ABT',
                  subtitle: 'ArcBlock Token',
                  content: feedContent[randomIndexABT],
                  content_color: '#222222',
                  sub_content: feedSubContent[randomIndexABT],
                  sub_content_color: '#09f4A7',
                },
              ],
            },
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
