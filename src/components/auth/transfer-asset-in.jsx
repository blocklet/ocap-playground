/* eslint-disable react/jsx-one-expression-per-line */
import useToggle from 'react-use/lib/useToggle';

import DidConnect from '@arcblock/did-connect-react/lib/Connect';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function TransferTokenIn() {
  const [isOpen, setOpen] = useToggle(false);
  return (
    <>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Send 1 Certificate to Wallet
      </Button>
      <DidConnect
        popup
        open={isOpen}
        action="transfer_asset_in"
        checkFn={api.get}
        onClose={() => setOpen()}
        onSuccess={() => window.location.reload()}
        messages={{
          title: 'Transfer Required',
          scan: 'Scan QR code to complete Certificate transfer',
          confirm: 'Confirm on your DID Wallet',
          success: 'Certificate transfer sent!',
        }}
      />
    </>
  );
}
