/* eslint-disable react/jsx-one-expression-per-line */
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';

import AuthButton from '../general';

export default function SignatureClaim({ type = 'transaction' }) {
  return (
    <AuthButton
      button={`Sign ${capitalize(type)}`}
      action="claim_signature"
      extraParams={{ type }}
      messages={{
        title: `Sign ${capitalize(type)}`,
        scan: `Scan QR code to get the ${type} claim`,
        confirm: 'Confirm on your DID Wallet',
        success: 'Claim processed',
      }}
    />
  );
}

SignatureClaim.propTypes = {
  type: PropTypes.string,
};
