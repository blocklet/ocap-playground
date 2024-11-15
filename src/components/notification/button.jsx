/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable arrow-parens */
import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import Button from '@arcblock/ux/lib/Button';
import Toast from '../toast';

export default function NotificationButton({ type, data, actions, children }) {
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
        Toast.success('Message has been sent!');
      })
      .catch(err => {
        setLoading(false);
        Toast.error(err.response ? err.response.statusText : err.message);
      });
  };

  return (
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
  );
}

NotificationButton.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object,
  actions: PropTypes.array,
  children: PropTypes.any.isRequired,
};

NotificationButton.defaultProps = {
  actions: [],
  data: {},
};
