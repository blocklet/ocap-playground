/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import useToggle from 'react-use/lib/useToggle';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';

import api from '../../../libs/api';
import getWebWalletUrl from '../../../libs/util';

export default function AuthPrincipal() {
  const [isOpen, setOpen] = useToggle(false);
  const [error, setError] = useState('');
  const [authorizeId, setAuthorizeId] = useState(null);
  const webWalletUrl = getWebWalletUrl();

  const fetchAuthorization = async () => {
    const { data } = await api.get('/api/authorizations');
    if (data.error) {
      setError(data.error);
    } else {
      // eslint-disable-next-line no-console
      console.log('authorization fetched', data);
      setAuthorizeId(data.authorizeId);
      setOpen(true);
    }
  };

  return (
    <React.Fragment>
      <Button
        color={error ? 'danger' : 'secondary'}
        variant="contained"
        size="large"
        className="action"
        onClick={fetchAuthorization}>
        {error || "Verify dApp's Authorization to Agent"}
      </Button>
      {authorizeId && isOpen && (
        <Auth
          responsive
          action="profile"
          prefix={`/api/agent/${authorizeId}`}
          checkFn={api.get}
          onClose={() => setOpen()}
          onSuccess={() => setOpen(false)}
          webWalletUrl={webWalletUrl}
          messages={{
            title: "Verify dApp's Authorization",
            scan: 'Scan QR code to get the authorization',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Authorization verified',
          }}
        />
      )}
    </React.Fragment>
  );
}

AuthPrincipal.propTypes = {};
