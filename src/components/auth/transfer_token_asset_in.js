/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';
import PropTypes from 'prop-types';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';
import getWebWalletUrl from '../../libs/util';

export default function TransferTokenAssetIn({ token }) {
  const [isOpen, setOpen] = useToggle(false);
  const webWalletUrl = getWebWalletUrl();

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Send 1 {token.local.symbol} + 1 Asset to Wallet
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="transfer_token_asset_in"
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Transfer Required',
            scan: 'Scan QR code to complete transfer',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Transfer sent!',
          }}
          webWalletUrl={webWalletUrl}
        />
      )}
    </React.Fragment>
  );
}

TransferTokenAssetIn.propTypes = {
  token: PropTypes.object.isRequired,
};
