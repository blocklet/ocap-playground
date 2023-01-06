const Notification = require('@blocklet/sdk/service/notification');
const Mcrypto = require('@ocap/mcrypto');
const { fromTokenToUnit, toBase64 } = require('@ocap/util');
const { fromRandom } = require('@ocap/wallet');
const { create } = require('@arcblock/vc');
const { LoremIpsum } = require('lorem-ipsum');
const createPassportSvg = require('../libs/nft/passport');
const badgeArray = require('../libs/svg');

const { wallet, client, authClient, factory: assetFactory } = require('../libs/auth');
const env = require('../libs/env');
const { ensureAsset } = require('../libs/util');
const itx = require('../libs/token');

const hasher = Mcrypto.getHasher(Mcrypto.types.HashType.SHA3);

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 10,
    min: 3,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

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
              title: title + lorem.generateWords(3),
              body: body + lorem.generateSentences(Math.ceil(Math.random() * 5)),
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
              title: title + lorem.generateWords(3),
              body: body + lorem.generateSentences(Math.ceil(Math.random() * 5)),
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
            title: title + lorem.generateWords(3),
            body: body + lorem.generateSentences(Math.ceil(Math.random() * 5)),
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
            title: title + lorem.generateWords(3),
            body: body + lorem.generateSentences(Math.ceil(Math.random() * 5)),
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
          const message = {
            title: lorem.generateWords(3),
            body: lorem.generateSentences(Math.ceil(Math.random() * 5)),
          };

          await Notification.sendToUser(userDid, {
            title: message.title,
            body: message.body,
            actions,
          });

          res.status(200).end();
          return;
        }

        if (type === 'long-text') {
          const message = {
            title: lorem.generateWords(Math.ceil(Math.random() * 9)),
            body: lorem.generateParagraphs(Math.ceil(Math.random() * 5)),
          };

          await Notification.sendToUser(userDid, {
            title: message.title,
            body: message.body,
            actions,
          });

          res.status(200).end();
          return;
        }

        if (type === 'link') {
          const { user: vt } = await authClient.getUser(userDid);

          const { transactions } = await client.listTransactions({
            accountFilter: { accounts: [userDid] },
            validityFilter: { validity: 'VALID' },
            paging: { size: 10 },
          });
          logger.info(transactions);
          const txHash =
            transactions && transactions.size > 0
              ? transactions[0].hash
              : '013F2EE0D44232AA27A48A6E58184C82073D8C0437D72EF7AAF80EA0FB42F464';
          const { assets } = await client.listAssets({ ownerAddress: userDid });
          const assetsDid = assets && assets.size > 0 ? assets[0].address : 'zjdouRzvdb4jRYuV6ZBdGMV93K2ciDyETCtj';
          const assetName = assets && assets.size > 0 ? assets[0].moniker : 'Badge';
          const message = {
            title: 'Test link text',
            body: `User <${vt.fullName}(did:beta:${userDid})> has a <Transaction(tx:beta:${txHash})> and it will give your a <${assetName}(nft:beta:${assetsDid})> on the DApp <OCAP Playground(dapp:beta:zNKeLKixvCM32TkVM1zmRDdAU3bvm3dTtAcM)> and there maybe is a <Stake(stake:beta:zrjzeu6w2Q7UBqRN32WrRvxRUrt8idndd7FX)>, this stake is coming from <Unknown User(did:beta:z1USvbEsoy5maeUuzP1vt9ZoX5pmdBmkb7t)>.`,
          };
          await Notification.sendToUser(userDid, {
            title: message.title,
            body: message.body,
            actions: [],
          });
          res.status(200).end();
          return;
        }
        if (type === 'fake_reply') {
          const { user: vt } = await authClient.getUser(userDid);
          const num = Math.floor(Math.random() * 100 + 1);
          await Notification.sendToUser(userDid, {
            title: 'User reply to you',
            body: `<${vt.fullName}(did:abt:${userDid})> reply to you: \n这个教程很赞👍🏻️`,
            level: 'normal', // success error warning
            attachments: [
              {
                type: 'link',
                data: {
                  link: 'https://giveaway.didwallet.io/did-comments/discussions/49231adb-9008-4c05-bfb2-9d2dedf9a7c2',
                  title: '如何参加转推领奖活动',
                  desc: '1.使用浏览器打开转推领奖活动页面. 2.点击想要参加或者查看的活动，进入活动详情. 3.填写推文链接完成活动绑定. 4.完成绑定之后，即可根据奖励的要求奖励领取',
                  image: `https://picsum.photos/id/${num}/200/300`,
                },
              },
            ],
            actions: [],
          });
          res.status(200).end();
          return;
        }
        if (type === 'fake_dapp') {
          await Notification.sendToUser(userDid, {
            title: '应用推荐',
            body: '推荐给你一个有趣的应用:',
            level: 'normal', // success error warning
            attachments: [
              {
                type: 'dapp',
                data: {
                  url: 'https://token-prize-pool-bfg-18-180-145-193.ip.abtnet.io/',
                  app_did: 'zNKuEeFscqBDfaS5RMrmFKdQmucpcQkPEJgi',
                  logo: 'https://token-prize-pool-bfg-18-180-145-193.ip.abtnet.io/.well-known/service/blocklet/logo/',
                  title: 'Token Prize',
                  desc: '奖金池开启，速来瓜分🏃🏻🏃🏻🏃🏻~\n[测试] 使用 DID 钱包 + Twitter 账户即可参与奖池瓜分，更有机会直接赢走 50% 奖池数额，快来参加吧！！！',
                },
              },
              {
                type: 'text',
                data: {
                  text: '奖金池开启，速来瓜分🏃🏻🏃🏻🏃🏻~\n[测试] 使用 DID 钱包 + Twitter 账户即可参与奖池瓜分，更有机会直接赢走 50% 奖池数额，快来参加吧！！！',
                },
              },
              {
                type: 'image',
                data: {
                  image_url:
                    'https://image-bin-gp9-18-180-145-193.ip.abtnet.io/uploads/1672901762844-W7CNIE6B3av0F_6zR5uURKQB.jpeg',
                  alt_text: '',
                  title: '',
                },
              },
            ],
            actions: [
              {
                name: 'Open Dapp',
                title: 'Open Dapp',
                link: 'https://token-prize-pool-bfg-18-180-145-193.ip.abtnet.io/',
              },
            ],
          });
          res.status(200).end();
          return;
        }

        if (type === 'fake_tx') {
          // const { transactions } = await client.listTransactions({
          //   accountFilter: { accounts: [userDid] },
          //   validityFilter: { validity: 'VALID' },
          //   paging: { size: 10 },
          // });
          const txHash = '013F2EE0D44232AA27A48A6E58184C82073D8C0437D72EF7AAF80EA0FB42F464';
          await Notification.sendToUser(userDid, {
            title: '奖励交易',
            body: '恭喜你！你获得了本次的幸运大奖',
            level: 1,
            attachments: [
              {
                type: 'transaction',
                data: {
                  hash: txHash,
                  chainId: 'beta',
                },
              },
            ],
            actions: [],
          });
          res.status(200).end();
          return;
        }
        if (type === 'fake_tx') {
          const { transactions } = await client.listTransactions({
            accountFilter: { accounts: [userDid] },
            validityFilter: { validity: 'VALID' },
            paging: { size: 10 },
          });
          const txHash =
            transactions && transactions.size > 0
              ? transactions[0].hash
              : '013F2EE0D44232AA27A48A6E58184C82073D8C0437D72EF7AAF80EA0FB42F464';
          await Notification.sendToUser(userDid, {
            title: '完成交易',
            body: '恭喜你！你完成了本次交易！',
            level: 'normal', // success error warning
            attachments: [
              {
                type: 'transaction',
                data: {
                  hash: txHash,
                  chainId: 'beta',
                },
              },
            ],
            actions: [],
          });
          res.status(200).end();
          return;
        }

        if (type === 'fake_other_tx') {
          const txHash = '013F2EE0D44232AA27A48A6E58184C82073D8C0437D72EF7AAF80EA0FB42F464';
          await Notification.sendToUser(userDid, {
            title: '您监控的账户产生交易',
            body: '您监控的账户产生了交易：',
            level: 'normal', // success error warning
            attachments: [
              {
                type: 'transaction',
                data: {
                  hash: txHash,
                  chainId: 'beta',
                },
              },
            ],
            actions: [],
          });
          res.status(200).end();
          return;
        }

        if (type === 'fake_img') {
          await Notification.sendToUser(userDid, {
            title: 'Send you a image',
            body: '这张图片已上传DID Space',
            level: 'success', // normal success error warning
            attachments: [
              {
                type: 'image',
                data: {
                  image_url:
                    'https://image-bin-gp9-52-52-139-202.ip.abtnet.io/uploads/1671690265269-s2gGJ6PmJkq4raXidJM3aIMk.png',
                  alt_text: 'DID Spaces Image',
                  title: 'DID Spaces Image',
                },
              },
            ],
            actions: [{ name: 'View', title: 'View', link: 'https://storage.staging.abtnet.io/app/admin/user/spaces' }],
          });
          res.status(200).end();
          return;
        }
        if (type === 'fake_reward') {
          const { user: vt } = await authClient.getUser(userDid);

          await Notification.sendToUser(userDid, {
            title: 'Sold a DApp',
            body: `<${vt.fullName}(did:abt:${userDid})> 购买了您的应用 <DID Discuss(link:https://test.store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu)>`,
            level: 'normal', // success error warning
            attachments: [
              {
                type: 'section',
                fields: [
                  {
                    type: 'text',
                    data: {
                      type: 'plain',
                      text_color: '#9397A1',
                      text: '本次收益',
                    },
                  },
                  {
                    type: 'text',
                    data: {
                      type: 'plain',
                      text_color: '#25C99B',
                      text: '+ 8 ABT',
                    },
                  },
                  {
                    type: 'text',
                    data: {
                      type: 'plain',
                      text_color: '#9397A1',
                      text: '收益日期',
                    },
                  },
                  {
                    type: 'text',
                    data: {
                      type: 'plain',
                      text: '2023年1月3日 上午8:00',
                    },
                  },
                  {
                    type: 'text',
                    data: {
                      type: 'plain',
                      text_color: '#9397A1',
                      text: '今日收益',
                    },
                  },
                  {
                    type: 'text',
                    data: {
                      type: 'plain',
                      text: '+ 10 TBA',
                    },
                  },
                  {
                    type: 'text',
                    data: {
                      type: 'plain',
                      text_color: '#9397A1',
                      text: '本月收益',
                    },
                  },
                  {
                    type: 'text',
                    data: {
                      type: 'plain',
                      text: '+ 100 TBA',
                    },
                  },
                ],
              },
              {
                type: 'divider',
                data: {},
              },
              {
                type: 'transaction',
                data: {
                  hash: 'EA0DC45CA6BFB3ED2A0E7406952C813D0C285E317F450244ACD73FB2602CD78B',
                  chainId: 'beta',
                },
              },
            ],
            actions: [],
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
