/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable arrow-parens */
import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import Button from '@arcblock/ux/lib/Button';
import Alert from '../alert';

export default function NotificationButton({ type, data, actions, children }) {
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);

  const sendNotification = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    axios
      .post('api/notification', {
        data: {
          type,
          content: data,
          actions,
        },
      })
      .then(() => {
        setLoading(false);
        setMessage({ variant: 'success', text: 'Message has been sent!' });
      })
      .catch(err => {
        setLoading(false);
        setMessage({ variant: 'error', text: err.message });
      });
  };

  return (
    <>
      <Button
        disabled={loading}
        variant="contained"
        color="primary"
        size="large"
        target="_blank"
        onClick={() => sendNotification()}
        className="action">
        {children}
      </Button>
      {!!message && <Alert variant={message.variant} onClose={() => setMessage(false)} message={message.text} />}
    </>
  );
}

NotificationButton.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  actions: PropTypes.array,
  children: PropTypes.any.isRequired,
};

NotificationButton.defaultProps = {
  actions: [],
};
