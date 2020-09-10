/* eslint-disable no-console */
require('dotenv').config();

// eslint-disable-next-line import/no-extraneous-dependencies
const ForgeSDK = require('@arcblock/forge-sdk');
const { wallet } = require('../api/libs/auth');

const dAppWallet = ForgeSDK.Wallet.fromJSON(wallet);

(async () => {
  const [hash, factoryAddress] = await ForgeSDK.createAssetFactory({
    moniker: `Movie_Ticket_Machine_${dAppWallet.toAddress()}`,
    readonly: false, // if we want to update the machine, we should set this to false
    transferrable: false,
    factory: {
      description: 'Movie Ticket Machine',
      limit: 99999,
      price: 1,
      template: JSON.stringify({
        cinema: '{{cinema}}',
        name: '{{name}}',
        location: '{{location}}',
        row: '{{row}}',
        seat: '{{seat}}',
        datetime: '{{datetime}}',
      }),
      templateVariables: ['cinema', 'name', 'location', 'row', 'seat', 'datetime'],
      assetName: 'MovieTicket',
      attributes: {
        transferrable: true,
        ttl: 0,
      },
    },
    wallet: dAppWallet,
  });
  console.log('create factory hash:', hash);
  console.log('factory address:', factoryAddress);
  process.exit(0);
})();
