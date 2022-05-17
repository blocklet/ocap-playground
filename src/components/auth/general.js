/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import DidConnect from '@arcblock/did-connect/lib/Connect';
import Button from '@arcblock/ux/lib/Button';

import api from '../../libs/api';
import Toast from '../toast';

// eslint-disable-next-line object-curly-newline
export default function GeneralAuthButton({ button, action, messages, timeout, extraParams }) {
  const [isOpen, setOpen] = useState(false);
  const [isComplete, setComplete] = useState(false);

  return (
    <>
      <Button color="secondary" variant="contained" size="large" className="action" onClick={() => setOpen(true)}>
        {button}
      </Button>
      <DidConnect
        popup
        open={isOpen && !isComplete}
        action={action}
        checkFn={api.get}
        socketUrl={api.socketUrl}
        onClose={() => setOpen(false)}
        checkTimeout={timeout}
        extraParams={extraParams}
        onSuccess={() => {
          setComplete(true);
          Toast.success(messages.success);
        }}
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
  extraParams: PropTypes.object,
};

GeneralAuthButton.defaultProps = {
  extraParams: {},
  timeout: 5 * 60 * 1000,
};
