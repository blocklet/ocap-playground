/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';

import AuthButton from '../general';

export default function SignatureClaim({ type }) {
  return (
    <AuthButton
      button={`Sign ${capitalize(type)}`}
      action="claim_signature"
      extraParams={{ type }}
      messages={{
        title: `Sign ${capitalize(type)}`,
        scan: `Scan QR code to get the ${type} claim`,
        confirm: 'Confirm on your ABT Wallet',
        success: 'Claim processed',
      }}
    />
  );
}

SignatureClaim.propTypes = {
  type: PropTypes.string,
};

SignatureClaim.defaultProps = {
  type: 'transaction',
  // type: 'text',
  // type: 'html',
};
