require('dotenv').config();

require('../api/libs/contracts/create_movie_ticket_contract/.compiled/create_movie_ticket/javascript/index');

/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toAssetAddress } = require('@arcblock/did-util');
const { decodeAny } = require('@arcblock/forge-message/lite');
const { fromRandom } = require('@arcblock/forge-wallet');

require('../api/libs/auth');

const factoryAddress = 'zjdu1oSvtHMn7t4jzfAcYHSsQW8UFa2cEQTz';
const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

(async () => {
  const user = fromRandom();
  await ForgeSDK.declare({ moniker: 'user', wallet: user });
  await ForgeSDK.checkin({ wallet: user });
  await sleep(3000);

  const { state } = await ForgeSDK.getAssetState({ address: factoryAddress });
  if (!state) {
    throw new Error('Asset factory address does not exist on chain');
  }

  const decoded = decodeAny(state.data);
  if (!decoded) {
    throw new Error('Asset factory state cannot be decoded');
  }

  const factory = decoded.value;

  const assetVariables = [
    {
      cinema: '万达影院',
      name: '阿甘正传',
      location: '朝阳区',
      row: '6',
      seat: '6',
      datetime: new Date().toISOString(),
    },
  ];

  const assets = assetVariables.map(x => {
    const payload = {
      readonly: true,
      transferrable: factory.attributes.transferrable,
      ttl: factory.attributes.ttl,
      parent: factoryAddress,
      data: {
        type: factory.assetName,
        value: x,
      },
    };

    const address = toAssetAddress(payload);
    console.log({ x, payload, address });

    return { address, data: JSON.stringify(x) };
  });

  try {
    const hash = await ForgeSDK.sendAcquireAssetTx({
      tx: {
        itx: {
          to: factoryAddress,
          specs: assets,
        },
      },
      wallet: user,
    });

    console.log({ hash });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
