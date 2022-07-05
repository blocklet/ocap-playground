/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */
require('dotenv').config();
const Notification = require('@blocklet/sdk/service/notification');
const { fromTokenToUnit } = require('@ocap/util');
const { wallet, client, factory: assetFactory } = require('./libs/auth');
const env = require('./libs/env');
const itx = require('./libs/token');
const { ensureAsset } = require('./libs/util');

global.logger = console;

const isDev = process.env.NODE_ENV === 'development';

const { name, version } = require('../package.json');
const { server } = require('./functions/app');

const port = parseInt(isDev ? process.env.APP_PORT : process.env.BLOCKLET_PORT, 10);
if (isNaN(port)) {
  throw new Error('Can not start api server without a valid port');
}

server.listen(port, err => {
  if (err) throw err;
  console.log(`> ${name} v${version} ready on ${port}`);
});

Notification.on('menus', async data => {
  console.log('************');
  console.log('menus', data);
  const sender = data.sender.did;
  await Notification.sendToUser(sender, {
    type: 'menus',
    data: {
      menus: [
        {
          name: 'Ask Test Token',
          type: 'event',
          data: 'ask-token',
        },
        {
          name: 'Ask Test Asset',
          type: 'event',
          data: 'ask-asset',
        },
        {
          name: 'Open ArcBlock.io',
          type: 'link',
          data: 'https://www.arcblock.io/',
        },
      ],
    },
  });
  console.log('************');
});

Notification.on('ask-token', async data => {
  console.log('************');
  console.log('menus', data);
  const sender = data.sender.did;
  try {
    const amount = Math.random().toFixed(6);
    await client.transfer({
      to: sender,
      token: 0,
      tokens: [{ address: env.foreignTokenId, value: amount }],
      wallet,
    });
    await Notification.sendToUser(sender, {
      title: 'Send Random Token',
      body: 'Some test token has been sent to you, please have a check',
      attachments: [
        {
          type: 'token',
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
      actions: [],
    });
  } catch (e) {
    console.error(e);
  }
  console.log('************');
});

Notification.on('ask-asset', async data => {
  console.log('************');
  console.log('menus', data);
  // const sender = data.sender.did;
  // try {
  //   const asset = await ensureAsset(assetFactory, {
  //     userPk: user.pk,
  //     userDid,
  //     type: 'badge',
  //     name: 'Badge',
  //     description: 'Badge ',
  //     svg: './public/static/images/badge.svg',
  //     location: 'China',
  //     backgroundUrl: '',
  //     logoUrl: 'https://releases.arcblockio.cn/arcblock-logo.png',
  //     startTime: new Date(),
  //     endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  //   });
  // } catch (e) {
  //   console.error(e);
  // }
  console.log('************');
});
