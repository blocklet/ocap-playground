/* eslint-disable react/jsx-one-expression-per-line */
import useToggle from 'react-use/lib/useToggle';

import DidConnect from '@arcblock/did-connect-react/lib/Connect';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';

export default function TransferTokenOut() {
  const [isOpen, setOpen] = useToggle(false);

  return (
    <>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        Send 1 Asset to Application
      </Button>
      <DidConnect
        popup
        open={isOpen}
        action="transfer_asset_out"
        checkFn={api.get}
        onClose={() => setOpen()}
        onSuccess={() => window.location.reload()}
        messages={{
          title: 'Transfer Required',
          scan: 'Scan QR code to complete asset transfer',
          confirm: 'Confirm on your DID Wallet',
          success: 'Asset transfer sent!',
        }}
      />
    </>
  );
}
