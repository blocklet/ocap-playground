/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DidConnect from '@arcblock/did-connect/lib/Connect';
import Button from '@arcblock/ux/lib/Button';
import { Confirm } from '@arcblock/ux/lib/Dialog';

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import Alert from '../alert';
import api from '../../libs/api';
import getWebWalletUrl from '../../libs/util';

export default function ClaimButton({ button, action, messages, timeout, extraParams }) {
  const [claimable, setClaimable] = useState([]);
  const [isClaimableOpen, setClaimableOpen] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isComplete, setComplete] = useState(false);
  const [selected, setSelected] = useState(null);

  const onClose = () => {
    setClaimableOpen(false);
    setOpen(false);
    setComplete(false);
  };

  const onOpenSelect = async () => {
    if (loading) {
      return;
    }
    if (claimable.length) {
      setClaimableOpen(true);
      return;
    }

    setLoading(true);
    const { data } = await api.get('/api/stakes/claimable');
    if (data.length) {
      setSelected(data[0].hash);
    }
    setClaimable(data);
    setClaimableOpen(true);
    setLoading(false);
  };

  const onConfirmSelect = () => setOpen(!!selected);

  const onClaimableChange = e => setSelected(e.target.value);

  const webWalletUrl = getWebWalletUrl();

  return (
    <>
      <Button
        color="secondary"
        variant="contained"
        size="large"
        className="action"
        onClick={onOpenSelect}
        disabled={loading}>
        {button}
      </Button>
      {isClaimableOpen && (
        <Confirm open title="Select" onConfirm={onConfirmSelect} onCancel={onClose}>
          <FormControl fullWidth>
            <InputLabel>Select Stake to Claim</InputLabel>
            {claimable.length > 0 ? (
              <Select value={selected} onChange={onClaimableChange}>
                {claimable.map(x => (
                  <MenuItem key={x.hash} value={x.hash}>
                    <p>Hash: {x.hash}</p>
                    <p>Time: {x.time}</p>
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <p>No pending stakes for claim, you must revoke stake first</p>
            )}
          </FormControl>
        </Confirm>
      )}
      {isOpen && !isComplete && selected && (
        <DidConnect
          responsive
          action={action}
          checkFn={api.get}
          socketUrl={api.socketUrl}
          onClose={() => setOpen(false)}
          checkTimeout={timeout}
          extraParams={{ hash: selected, ...extraParams }}
          onSuccess={() => setComplete(true)}
          messages={messages}
          webWalletUrl={webWalletUrl}
        />
      )}
      {isComplete && <Alert onClose={onClose} message={messages.success} />}
    </>
  );
}

ClaimButton.propTypes = {
  button: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  messages: PropTypes.object.isRequired,
  timeout: PropTypes.number,
  extraParams: PropTypes.object,
};

ClaimButton.defaultProps = {
  extraParams: {},
  timeout: 5 * 60 * 1000,
};
