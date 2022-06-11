/* eslint-disable react/jsx-one-expression-per-line */
import { useState } from 'react';
import useToggle from 'react-use/lib/useToggle';

import DidConnect from '@arcblock/did-connect/lib/Connect';
import Button from '@arcblock/ux/lib/Button';

import api from '../../../libs/api';

export default function AuthPrincipal() {
  const [isOpen, setOpen] = useToggle(false);
  const [error, setError] = useState('');
  const [authorizeId, setAuthorizeId] = useState(null);

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
    <>
      <Button
        color={error ? 'danger' : 'secondary'}
        variant="contained"
        size="large"
        className="action"
        onClick={fetchAuthorization}>
        {error || "Verify dApp's Authorization to Agent"}
      </Button>
      <DidConnect
        popup
        open={authorizeId && isOpen}
        action="profile"
        prefix={`/api/agent/${authorizeId}`}
        checkFn={api.get}
        onClose={() => setOpen()}
        onSuccess={() => setOpen(false)}
        messages={{
          title: "Verify dApp's Authorization",
          scan: 'Scan QR code to get the authorization',
          confirm: 'Confirm on your DID Wallet',
          success: 'Authorization verified',
        }}
      />
    </>
  );
}

AuthPrincipal.propTypes = {};
