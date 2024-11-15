/* eslint-disable react/jsx-one-expression-per-line */
import { useState } from 'react';
import PropTypes from 'prop-types';

import DidConnect from '@arcblock/did-connect/lib/Connect';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';
import Toast from '../toast';

// eslint-disable-next-line object-curly-newline
export default function GeneralAuthButton({
  button,
  action,
  messages,
  timeout,
  extraParams,
  autoConnect,
  saveConnect,
  forceConnected,
  onSuccess,
}) {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        {button}
      </Button>
      <DidConnect
        popup
        open={isOpen}
        action={action}
        checkFn={api.get}
        onClose={() => setOpen(false)}
        checkTimeout={timeout}
        extraParams={extraParams}
        onSuccess={() => {
          setOpen(false);
          Toast.success(messages.success);
          onSuccess();
        }}
        autoConnect={autoConnect}
        saveConnect={saveConnect}
        forceConnected={forceConnected}
        messages={messages}
      />
    </>
  );
}

GeneralAuthButton.propTypes = {
  button: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  messages: PropTypes.object.isRequired,
  timeout: PropTypes.number,
  autoConnect: PropTypes.bool,
  saveConnect: PropTypes.bool,
  forceConnected: PropTypes.bool,
  extraParams: PropTypes.object,
  onSuccess: PropTypes.func,
};

GeneralAuthButton.defaultProps = {
  extraParams: {},
  timeout: 5 * 60 * 1000,
  autoConnect: true,
  saveConnect: true,
  forceConnected: true,
  onSuccess: () => {},
};
