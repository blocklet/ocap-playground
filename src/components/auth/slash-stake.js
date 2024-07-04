import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@arcblock/ux/lib/Button';
import upperFirst from 'lodash/upperFirst';

import Toast from '../toast';
import api from '../../libs/api';

export default function SlashButton({ type, action }) {
  const [loading, setLoading] = useState(false);

  const onSlash = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    const { data } = await api.post(`/api/stakes/slash/${type}?action=${action}`);
    setLoading(false);

    if (data.error) {
      Toast.error(data.error);
    } else {
      Toast.success(`${action} success: ${data.hash}`);
    }
  };

  return (
    <Button
      color={action === 'slash' ? 'error' : 'success'}
      variant="contained"
      size="large"
      className="action"
      onClick={onSlash}
      disabled={loading}>
      {upperFirst(action)} Staked {type}
    </Button>
  );
}

SlashButton.propTypes = {
  type: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
};

SlashButton.defaultProps = {};
