/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';
import getWebWalletUrl from '../../libs/util';

export default function TransferTokenOut() {
  const [isOpen, setOpen] = useToggle(false);
  const webWalletUrl = getWebWalletUrl();

  return (
    <React.Fragment>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Send 1 Asset to Application
      </Button>
      {isOpen && (
        <Auth
          responsive
          action="transfer_asset_out"
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen()}
          onSuccess={() => window.location.reload()}
          messages={{
            title: 'Transfer Required',
            scan: 'Scan QR code to complete asset transfer',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Asset transfer sent!',
          }}
          webWalletUrl={webWalletUrl}
        />
      )}
    </React.Fragment>
  );
}
