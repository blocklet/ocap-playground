import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@arcblock/ux/lib/Button';

import Toast from '../toast';
import api from '../../libs/api';

export default function SlashButton({ type }) {
  const [loading, setLoading] = useState(false);

  const onSlash = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    const { data } = await api.post(`/api/stakes/slash/${type}`);
    setLoading(false);

    if (data.error) {
      Toast.error(data.error);
    } else {
      Toast.success(`You have successfully slashed: ${data.hash}`);
    }
  };

  return (
    <Button color="error" variant="contained" size="large" className="action" onClick={onSlash} disabled={loading}>
      Slash Staked {type}
    </Button>
  );
}

SlashButton.propTypes = {
  type: PropTypes.string.isRequired,
};

SlashButton.defaultProps = {};
